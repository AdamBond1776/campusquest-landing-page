# CampusQuest

Marketing site, signup flow, and the Genius Mining questionnaire for CampusQuest, a
personalized discovery layer for college life. Students find the clubs, events, and
opportunities that match their interests; organizations get discovered by the
students who actually want to be there. Piloting in Rhode Island.

## Running locally

Requires Node 20.9 or newer.

```sh
npm install
npm run dev
```

The dev server listens on <http://localhost:43917>.

**Nothing needs configuring to run it.** With no environment variables set at all,
the marketing site and both auth flows work against a `localStorage` mock, and the
Genius Mining questionnaire runs end to end against a file-backed store and a
stand-in analysis engine. That is the intended way to develop: no Supabase project,
no API keys, no spent model calls. See [Environment](#environment) for what each
variable switches on.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server on port 43917 |
| `npm run build` | Production build |
| `npm run start` | Serve the production build on port 43917 |
| `npm run typecheck` | Type-check without emitting |
| `npm run lint` | ESLint across the repo |
| `npm run test` | Vitest suite (once) |
| `npm run test:watch` | Vitest in watch mode |
| `npm run smoke` | Browser smoke test of auth and consent (needs Chrome) |
| `npm run smoke:gm` | Browser walkthrough of the whole instrument (needs Chrome) |
| `npm run smoke:institutions` | Browser test of the institutional page and demand button (needs Chrome) |
| `npm run build:check` | Build into a scratch directory, safe to run while `dev` is up |
| `npm run og` | Regenerate the social card image (needs Chrome) |
| `npm run gm:prompts` | Rebuild the bundled prompt module from the source `.txt` files |

## Routes

| Path | What it is |
| --- | --- |
| `/` | Marketing page |
| `/signup` | Four-step onboarding: role, interests, plan, email |
| `/signup?finish=1` | The same wizard for an account that has a session but no answers yet |
| `/login` | Magic-link login |
| `/welcome` | Post-signup and post-login confirmation |
| `/auth/callback` | Exchanges the emailed code for a session |
| `/auth/auth-code-error` | Expired or rejected link |
| `/activities` | The activity directory: clubs, campus events, and athletics fixtures |
| `/institutions` | Level Up Rhode Island: the public institutional page and the demand button |
| `/privacy` | Privacy and data use notice |
| `/terms` | Terms of use |
| `/genius-mining` | Consent screen and what the instrument is |
| `/genius-mining/questionnaire` | The instrument itself, sections A through E |
| `/genius-mining/profile` | Run the analysis, then the student-facing profile |
| `/genius-mining/profile/advisor` | Advisor printout, built for print and PDF |
| `/admin/genius-mining` | Pathway coverage, instrument health, retention summary |
| `/api/cron/retention` | Daily retention job. Requires `CRON_SECRET` as a bearer token |
| `/api/cron/activities` | Refreshes the directory from every configured feed. Honours `CRON_SECRET` when set |
| `/api/billing/subscription-event` | Stripe webhook |

## Authentication

Passwordless, on Supabase magic links. `src/lib/auth.ts` is the whole surface:
`signInWithEmail`, `signUpWithEmail`, `completeOnboarding`, `getCurrentUser`, and
`signOut`. Signup carries the role, interests, and plan through as user metadata so
they land on the account when the link is opened.

A magic link creates the account the first time it is used, which means an address
typed into the login form that has never been seen becomes a new account with no
role, plan, or interests. Rejecting unknown addresses instead would leak which
addresses are registered, so `/auth/callback` routes those accounts into the
onboarding wizard at `/signup?finish=1`, which writes the answers to the existing
session rather than sending a second link.

Without Supabase credentials, all of it falls back to a `localStorage` mock that
simulates latency and reports whether an address was already on file. The mock is
never silent about being a mock: the check-your-inbox panel says so and offers a
"Continue without the link" shortcut that lands where the real callback would.

## The activity directory

The directory at `/activities` is the product students actually open. It holds
clubs, campus events, and athletics fixtures in one table (`cq_activities`)
rather than one per source, so the browse view and the Genius Mining pathway
data cannot drift apart.

### Sources

Nothing here scrapes HTML. Every campus already publishes this data in a
machine-readable form, and a published feed does not break when someone
restyles a page.

| Source | What it gives us | Standing |
| --- | --- | --- |
| Athletics (`gorhody.com`) | Every fixture for every sport, home and away | Sidearm Sports iCal, published to be subscribed to |
| Localist (`events.uri.edu`) | The university events calendar | Documented public read-only JSON API, allowed by `robots.txt` |
| Engage (`uri.campuslabs.com`) | The student organization directory | The Engage app's own backing search index — see the caveat below |

A live sync for URI returns 163 clubs, roughly 280 events, and 211 fixtures.

**The Engage caveat.** Unlike the other two, that endpoint is not a published,
supported product API. It is public and unauthenticated, but it can change shape
without notice and nobody owes us warning. The fix is an institution-issued
Engage API key, which a campus administrator can generate. It is isolated in
`src/lib/activities/sources/engage.ts` so swapping in a sanctioned key touches
one file.

### Freshness, which is the part that matters

A directory that sends a first-year to a club that folded last spring does not
get a second chance, so staleness is handled structurally rather than by
remembering to check:

- Ingested rows are `listed`. Only a person can mark a row `verified`, and only
  `verified` rows are eligible to become Genius Mining recommendations.
- A row that stops appearing in its source decays to `stale` on its own after a
  grace window long enough to survive a feed hiccup.
- A re-sync refreshes source fields but can never overwrite a verification, an
  operator's `hidden` flag, or a human's working-word tags. `reconcile` in
  `src/lib/activities/ingest.ts` is a pure function so those rules are testable.
- Every card shows its source and links back to it, because our copy can be
  wrong and a student deciding whether to cross campus should be able to check.

Rows the adapter distrusts are held at `pending` and never render publicly. URI's
directory, for instance, contains organizations its own student senate has
flagged for re-recognition.

### Home games

Filling seats is the athletics department's actual ask, so home fixtures get
their own rail above the directory. Detecting them needs both halves: the
summary saying `vs` **and** the venue matching. Twelve URI fixtures say `vs` but
are played in New Haven, Davidson, and Hampton, and pointing students at a home
game in North Carolina would cost the feature its credibility. 61 of 211
fixtures are genuinely at Kingston.

Run a sync with `curl -X POST localhost:43917/api/cron/activities?campus=uri`,
or on a schedule against the deployed route.

## Legal and consent

`/privacy` and `/terms` are generated from `src/lib/legal.ts`, which is also
where the consent model lives. Consent is three separately granted layers rather
than one signup checkbox:

1. **Running the service** — granted by making an account.
2. **Improving the instrument** — its own checkbox on the Genius Mining consent
   screen. Covers the de-identified structured corpus, which drops free text
   entirely while the cohort is small.
3. **Research** — written but inactive. If it is ever offered it needs an
   institutional review board, its own consent form, and it only covers data
   collected after approval.

The layering is deliberate. Running a product and running human-subjects
research are different activities under different rules, and bundling them is
how a pilot ends up in front of a review board it never applied to. Turning on
the third layer is a switch to flip, not a document to renegotiate.

**These documents have not been reviewed by an attorney and the operating entity
is not named yet.** Until `CQ_LEGAL_ENTITY` and `CQ_LEGAL_ADDRESS` are set, both
pages render a visible provisional banner rather than quietly omitting the
controller.

## Genius Mining

`packages/genius-mining` is a workspace package **owned by Hidden Genius Labs LLC**
and licensed to CampusQuest. It holds the instrument schema, the prompts, the
output contract, and the policy logic — working-word resolution, the retention
clock, analysis credits, de-identification, and the pathway coverage gate.

The boundary is structural, not just documented: the package performs no I/O,
imports nothing from the host app, and carries no CampusQuest branding, so it can
be licensed to another operator as-is. Read
[`LICENSE`](packages/genius-mining/LICENSE) and
[`NOTICE`](packages/genius-mining/NOTICE) before changing anything in that
directory.

Every product decision it encodes — what starts the 30-day deletion clock, what a
re-run costs, what each engine is allowed to see — is written down in
[`docs/genius-mining/POLICY.md`](docs/genius-mining/POLICY.md), and the code points
back at it. Start there.

Analyses run against a stand-in engine unless `ANTHROPIC_API_KEY` is set, and
profiles produced that way are stamped `mock-engine`, which the advisor printout
displays as a warning. A single analysis run is capped at two model calls.

### Entitlement is not billing

Three things can entitle a student to Genius Mining — an admin grant, an
institutional seat their school bought, or their own subscription — and
`resolveEntitlement` picks between them in that order. **The 30-day deletion clock
reads the resolved entitlement and never the Stripe snapshot.** When a school
covers a student we cancel their subscription and refund the unused days, which
means Stripe emits `customer.subscription.deleted`; a clock keyed to billing would
read that as abandonment and delete their answers on the day their school started
paying for them.

An institutional seat buys the instrument and the advisor printout at the Basic
level. It deliberately does not buy the social layer.

### Pricing lives in one file

[`src/lib/pricing.ts`](src/lib/pricing.ts) is the only place a price is written
down. The introductory offer has no end date on purpose: it promises a price lock
for as long as a subscription stays continuously active, plus 30 days' notice
before it closes to new sign-ups. Set `INTRO_OFFER.closesOn` when that notice
actually goes out.

### Research materials

[`docs/research/`](docs/research/) holds the IRB protocol outline, the nine-month
pilot design, how to source the retention figures, and the partner brief. They are
source material to be carried elsewhere, not something the app reads. The one
irreversible item is in the first: consent cannot be applied retroactively, so a
cohort that takes the instrument under the product consent alone can never become
research data.

## Environment

Copy `.env.example` to `.env.local` and set only what you need; every variable is
optional and documented there. The short version:

| Variable | Effect when unset |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Auth uses the local mock; both are needed for the real thing |
| `SUPABASE_SERVICE_ROLE_KEY` | The retention job and billing webhook cannot reach rows with no session |
| `ANTHROPIC_API_KEY` | Analyses use the stand-in engine |
| `RESEND_API_KEY` | Email is logged instead of sent |
| `CRON_SECRET` | The retention endpoint refuses to run at all |
| `GM_ALERT_EMAIL` | Alerts go to the `gm-alerts` group by default |
| `GM_ADMIN_EMAILS` | `/admin/genius-mining` returns 404 in production |
| `CQ_PARTNERSHIP_EMAIL` | `/institutions` shows the `partners@campusquestapp.com` placeholder |
| `CQ_LEGAL_ENTITY`, `CQ_LEGAL_ADDRESS` | `/privacy` and `/terms` render a provisional banner and name no controller |
| `CQ_PRIVACY_EMAIL` | Data requests fall back to `CQ_PARTNERSHIP_EMAIL` |
| `NEXT_PUBLIC_SOCIAL_INSTAGRAM`, `_TWITTER`, `_LINKEDIN` | The footer renders no social icons rather than dead links |
| `CQ_LOCAL_ACTIVITIES_PATH` | The directory falls back to a JSON file under the temp directory |
| `NEXT_PUBLIC_SITE_URL` | Social card and canonical URLs fall back to the Vercel host |

## Supabase setup

Two pieces are not code and have to be done in the Supabase dashboard.

1. **Run the migrations**, in order:
   - [`0001_genius_mining.sql`](supabase/migrations/0001_genius_mining.sql) —
     `gm_sessions`, the de-identified `gm_corpus`, the participant-code sequence,
     and the row-level security policies.
   - [`0002_entitlement.sql`](supabase/migrations/0002_entitlement.sql) —
     institutional seats and admin grants, which the deletion clock reads.
   - [`0004_activities.sql`](supabase/migrations/0004_activities.sql) —
     the activity directory, with public read limited to listed and verified rows.
   - [`0003_campus_demand.sql`](supabase/migrations/0003_campus_demand.sql) —
     students asking their school to cover Genius Mining.
2. **Point auth at Resend and allow the callback.** Enable the email provider, set
   the SMTP block to Resend with `auth.campusquestapp.com` as the sender, and add
   `/auth/callback` on every origin you use — production, previews, and
   `http://localhost:43917` — to the redirect allow list. A link that comes back to
   an origin not on that list fails with no useful error.

## Deploying

Built for Vercel. [`vercel.json`](vercel.json) schedules the retention job daily at
09:00 UTC against `/api/cron/retention`; that endpoint refuses to run unless
`CRON_SECRET` is set, so set it or the job silently never does anything. Set
`NEXT_PUBLIC_SITE_URL` too, or social previews resolve against the preview host.

For Stripe, `STRIPE_PREMIUM_PRICE_IDS` maps prices to the paid tier, and checkout
has to set `user_id` on the subscription metadata — without it a webhook cannot
tell whose data it is looking at.

## Project layout

```
src/
  app/            App Router: pages, route handlers, server actions
  components/     Marketing sections, form primitives, gm/ questionnaire UI
  lib/            auth, env, alerts, validation, supabase/, gm/ (storage, engine, jobs)
packages/
  genius-mining/  HGL-owned instrument, contracts, and policy logic
docs/
  genius-mining/  POLICY.md — the decisions the code enforces
  research/       IRB protocol, pilot study design, and the institutional briefs
supabase/
  migrations/     SQL applied to the Supabase project
scripts/          Social card generator and the headless-browser smoke suites
```

The `@` alias points at `src/`.

## Tests

```sh
npm run test
```

Vitest, run in a Node environment. The suite covers the policy logic rather than
the markup: working-word resolution including the unresolved tie, the retention
clock and the full warn-then-purge cycle, the analysis credit ceiling, engine
payload filtering and the identifier checks, contract validation,
de-identification, the pathway coverage gate, and section-by-section questionnaire
validation.

None of that touches a browser, which leaves a real gap: if the client bundle
never reaches the page, the server-rendered HTML still looks perfect while nothing
hydrates and every button silently does nothing. Typecheck, lint, the unit suite,
and `next build` all pass through that. `npm run smoke` is the check that does not
— it drives headless Chrome through consent, login, onboarding, and signup, and
starts by clicking a checkbox purely to prove React is attached.

```sh
npm run dev          # in one shell
npm run smoke        # in another — auth and consent
npm run smoke:gm     # the whole instrument, consent through advisor printout
npm run smoke:institutions   # the institutional page and the demand round trip
```

`smoke:gm` deliberately drives the awkward case rather than a clean one. It ties
the verb count three against three and puts both C1 picks on the same verb, so D1
has to resolve through the C1 tiebreak and land on FIXER. That is where the only
real arithmetic in the instrument lives.

Note that `npm run build` writes to the same `.next` the dev server is serving
from, so running it while `dev` is up overwrites those chunks and produces exactly
the dead-page symptom above. Use `npm run build:check` instead when the dev server
is running.

## Stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 3, Supabase for auth,
Resend for email, Stripe for billing, Anthropic for the analysis engine, and
lucide-react for icons. Brand colors (`brand`, `cream`, `gold`, `ink`) live in
[`tailwind.config.js`](tailwind.config.js).

## Status

Pre-launch. The marketing page, auth, the institutional page, and the full Genius
Mining flow — consent, questionnaire, analysis, student profile, advisor printout,
retention job, admin dashboard — are built and tested.

Outstanding:

- Stripe price-to-tier mapping and `user_id` on subscription metadata, without
  which a webhook cannot tell whose data it is looking at.
- An admin surface for granting and revoking institutional seats. The logic and
  the storage exist; today a seat is set through the admin path on
  `/api/billing/subscription-event`.
- The URInvolved pathway export. Seven of eight working words are below the
  coverage gate, so recommendations stay off.
- Legal review of the consent copy, and a research consent that does not exist yet.
- `CQ_PARTNERSHIP_EMAIL` — the institutional page currently shows a placeholder
  address.
