/**
 * Browser smoke test for the auth and consent flows.
 *
 * Exists because a whole class of failure is invisible to every other check in
 * this repo: if the client bundle does not reach the browser, the server-rendered
 * page still looks perfect, but nothing hydrates and every button silently does
 * nothing. Typecheck, lint, the unit suite and `next build` all pass while the
 * app is unusable. The only way to catch it is to click something.
 *
 * Drives headless Chrome over the DevTools protocol. No test-runner or browser
 * automation dependency — Node's WebSocket plus CDP is enough for this.
 *
 * Usage: npm run dev, then `npm run smoke` in another shell.
 * Override the target with SMOKE_URL.
 */
import { execFileSync, spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BASE = process.env.SMOKE_URL ?? 'http://localhost:43917';
const DEBUG_PORT = Number(process.env.SMOKE_DEBUG_PORT ?? 9222);

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  'google-chrome',
  'google-chrome-stable',
  'chromium',
  'chromium-browser',
].filter(Boolean);

function resolveChrome() {
  for (const candidate of CHROME_CANDIDATES) {
    try {
      execFileSync(candidate, ['--version'], { stdio: 'ignore' });
      return candidate;
    } catch {
      // Try the next candidate.
    }
  }
  throw new Error(
    'No Chrome or Chromium binary found. Install one, or set CHROME_PATH to its location.'
  );
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** A unique address per run, so a rerun is not a returning student. */
const NEW_EMAIL = `smoke-${Date.now()}@uri.edu`;

const results = [];
const check = (name, passed, detail = '') => {
  results.push({ name, passed, detail });
  console.log(`${passed ? 'ok  ' : 'FAIL'}  ${name}${detail ? `  — ${detail}` : ''}`);
};

// Fail loudly and early rather than reporting a dozen assertion failures that
// all mean "there was nothing to click".
try {
  const res = await fetch(BASE, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error(`responded ${res.status}`);
} catch (error) {
  console.error(`No app at ${BASE} — ${error.message}`);
  console.error('Start it with `npm run dev`, or point SMOKE_URL somewhere else.');
  process.exit(1);
}

const profile = mkdtempSync(join(tmpdir(), 'campusquest-smoke-'));
const chrome = spawn(
  resolveChrome(),
  [
    '--headless=new',
    `--remote-debugging-port=${DEBUG_PORT}`,
    `--user-data-dir=${profile}`,
    '--no-sandbox',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    'about:blank',
  ],
  { stdio: 'ignore' }
);

async function debuggerUrl() {
  for (let attempt = 0; attempt < 40; attempt++) {
    try {
      const res = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`);
      const page = (await res.json()).find((target) => target.type === 'page');
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch {
      // Chrome is not listening yet.
    }
    await sleep(250);
  }
  throw new Error('Chrome never exposed a debuggable page.');
}

let ws;
let exitCode = 0;

try {
  ws = new WebSocket(await debuggerUrl());
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', reject, { once: true });
  });

  let nextId = 0;
  const pending = new Map();
  const consoleErrors = [];

  ws.addEventListener('message', (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id !== undefined) {
      pending.get(msg.id)?.(msg);
      pending.delete(msg.id);
      return;
    }
    if (msg.method === 'Log.entryAdded' && msg.params.entry.level === 'error') {
      consoleErrors.push(msg.params.entry.text);
    }
  });

  const send = (method, params = {}) =>
    new Promise((resolve) => {
      const id = ++nextId;
      pending.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });

  const evaluate = async (expression) => {
    const res = await send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    return res.result?.result?.value;
  };

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Log.enable');

  const goto = async (path) => {
    await send('Page.navigate', { url: `${BASE}${path}` });
    await sleep(3000);
  };

  const text = () => evaluate('document.body.innerText');
  const has = async (needle) => (await text()).includes(needle);
  const here = () => evaluate('location.pathname + location.search');

  // React tracks input values on the DOM node itself, so assigning `.value` is
  // ignored. Going through the native setter is what makes onChange fire.
  const typeInto = (selector, value) =>
    evaluate(`
      (() => {
        const el = document.querySelector(${JSON.stringify(selector)});
        if (!el) return 'not found';
        const setter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype, 'value'
        ).set;
        setter.call(el, ${JSON.stringify(value)});
        el.dispatchEvent(new Event('input', { bubbles: true }));
        return el.value;
      })()
    `);

  const click = (needle, tag = 'button') =>
    evaluate(`
      (() => {
        const el = [...document.querySelectorAll(${JSON.stringify(tag)})]
          .find((n) => n.textContent.trim().includes(${JSON.stringify(needle)}));
        if (!el) return false;
        el.click();
        return true;
      })()
    `);

  // --- The page hydrates at all ---------------------------------------------
  await goto('/genius-mining');
  const boxChecked = await evaluate(`
    (() => {
      const box = document.querySelector('input[type="checkbox"]');
      if (!box) return false;
      box.click();
      return box.checked;
    })()
  `);
  check('consent checkbox responds to a click', boxChecked === true, 'proves hydration');

  await click('Start the questionnaire');
  await sleep(2500);
  check('consent advances to the questionnaire', (await here()) === '/genius-mining/questionnaire');

  // --- An unknown address is routed into onboarding -------------------------
  await goto('/login');
  await typeInto('input[type="email"]', NEW_EMAIL);
  await click('Email me a login link');
  await sleep(2500);
  check('login sends a link', await has('Check your inbox'));

  await click('Continue without the link', 'a');
  await sleep(3000);
  check('an unknown address lands in onboarding', (await here()) === '/signup?finish=1');
  check('onboarding explains why', await has('Your email is confirmed'));

  const backPresent = await evaluate(`
    [...document.querySelectorAll('button')].some((b) => b.textContent.trim() === 'Back')
  `);
  check('no Back button on the first step', backPresent === false);

  // --- Finishing writes the answers to the existing account -----------------
  await click('Student');
  await sleep(1200);
  await click('Music');
  await click('Continue');
  await sleep(1200);

  check('plan step drops the email field', (await evaluate('!!document.querySelector("input[type=email]")')) === false);
  check('plan step drops the log-in footer', !(await has('Already have an account')));

  await click('Premium');
  await sleep(400);
  check('submit offers to finish, not to email a link', await has('Finish setting up my account'));

  await click('Finish setting up my account');
  await sleep(3500);
  check('finishing lands on welcome', (await here()) === '/welcome?new=1');
  check('welcome names the account', await has(NEW_EMAIL));

  await goto('/welcome');
  check('the answers were saved, not just passed along', (await has(NEW_EMAIL)) && (await has('Premium')));

  // --- A returning address skips onboarding ---------------------------------
  await goto('/login');
  await typeInto('input[type="email"]', NEW_EMAIL);
  await click('Email me a login link');
  await sleep(2500);
  check('a known address is recognized', await has('We already know this address'));
  await click('Continue without the link', 'a');
  await sleep(3000);
  check('a returning address skips onboarding', (await here()) === '/welcome');

  // --- Normal signup is unchanged -------------------------------------------
  await goto('/signup');
  check('signup still opens on its welcome step', await has('Welcome to CampusQuest'));
  check('signup is not in finishing mode', !(await has('Your email is confirmed')));
  await click("Let's go");
  await sleep(1200);
  await click('Student');
  await sleep(1200);
  await click('Music');
  await click('Continue');
  await sleep(1200);
  check('signup still asks for an email', (await evaluate('!!document.querySelector("input[type=email]")')) === true);

  check('no console errors', consoleErrors.length === 0, consoleErrors.join(' | '));

  const failed = results.filter((r) => !r.passed);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  if (failed.length > 0) exitCode = 1;
} catch (error) {
  console.error(`\nSmoke test could not run: ${error.message}`);
  console.error(`Is the dev server up at ${BASE}?`);
  exitCode = 1;
} finally {
  ws?.close();
  chrome.kill();

  // Chrome keeps writing to its profile for a moment after the kill signal, so
  // removing it immediately races and throws. The directory is a temp one; a
  // failure to clean it up must not fail the run.
  await sleep(500);
  try {
    rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  } catch {
    // Left behind in the system temp directory.
  }
}

process.exit(exitCode);
