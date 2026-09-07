# CampusQuest

Marketing site, signup flow, and the Genius Mining questionnaire for CampusQuest, a
personalized discovery layer for college life. Students find the clubs, events, and
opportunities that match their interests; organizations get discovered by the
students who actually want to be there. Piloting at the University of Rhode Island.

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
| `/genius-mining` | Consent screen and what the instrument is |
| `/genius-mining/questionnaire` | The instrument itself, sections A through E |
| `/genius-mining/profile` | Run the analysis, then the student-facing profile |
| `/genius-mining/profile/advisor` | Advisor printout, built for print and PDF |
| `/admin/genius-mining` | Pathway coverage, instrument health, retention summary |
| `/api/cron/retention` | Daily retention job. Requires `CRON_SECRET` as a bearer token |
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
| `NEXT_PUBLIC_SITE_URL` | Social card and canonical URLs fall back to the Vercel host |

## Supabase setup

Two pieces are not code and have to be done in the Supabase dashboard.

1. **Run the migration.** Apply [`supabase/migrations/0001_genius_mining.sql`](supabase/migrations/0001_genius_mining.sql),
   which creates `gm_sessions`, the de-identified `gm_corpus`, the participant-code
   sequence, and the row-level security policies.
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
supabase/
  migrations/     SQL applied to the Supabase project
scripts/          Social card image generator
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

## Stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 3, Supabase for auth,
Resend for email, Stripe for billing, Anthropic for the analysis engine, and
lucide-react for icons. Brand colors (`brand`, `cream`, `gold`, `ink`) live in
[`tailwind.config.js`](tailwind.config.js).

## Status

Pre-launch. The marketing page, auth, and the full Genius Mining flow — consent,
questionnaire, analysis, student profile, advisor printout, retention job, admin
dashboard — are built and tested. Outstanding: Stripe price-to-tier mapping and
`user_id` on subscription metadata, the URInvolved pathway export (seven of eight
working words are below the coverage gate, so recommendations stay off), and legal
review of the consent copy.
