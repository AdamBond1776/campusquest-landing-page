# CampusQuest — Landing Page

Marketing site and signup flow for CampusQuest, a personalized discovery layer for
college life. Students find the clubs, events, and opportunities that match their
interests; organizations get discovered by the students who actually want to be
there. Piloting at the University of Rhode Island.

## Running locally

Requires Node 18 or newer.

```sh
npm install
npm run dev
```

The dev server prints a local URL (Vite defaults to port 5173).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server with hot reload |
| `npm run build` | Produce a production build in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | Type-check the app without emitting output |
| `npm run lint` | Run ESLint across the project |
| `npm run og` | Regenerate the social preview image (needs Chrome) |

## Routes

| Path | Page | Notes |
| --- | --- | --- |
| `/` | `src/pages/LandingPage.tsx` | Composes the marketing sections |
| `/signup` | `src/pages/Onboarding.tsx` | Four-step role, interests, and plan flow |
| `/login` | `src/pages/Login.tsx` | Login form |
| `/welcome` | `src/pages/Welcome.tsx` | Post-signup and post-login confirmation |

## Environment variables

Every variable is optional — the app runs with none of them set. Copy
`.env.example` to `.env` to configure any of the following.

| Variable | Effect when unset |
| --- | --- |
| `VITE_SITE_URL` | `og:image`, `og:url`, and `canonical` fall back to relative paths |
| `VITE_SUPABASE_URL` | Auth uses the local mock instead of Supabase |
| `VITE_SUPABASE_ANON_KEY` | Same as above; both must be set to enable Supabase |

## Authentication

`src/lib/auth.ts` exposes `signUp` and `signIn`. When both Supabase variables
are present it calls Supabase auth, passing the selected role, interests, and
plan through as user metadata. Otherwise it falls back to a `localStorage`-backed
mock that simulates latency and returns the same duplicate-account and
bad-credential errors, so the flows are demoable without a backend.

## Social preview image

`public/og-image.png` is generated, not hand-drawn. Edit `scripts/og-image.html`
and run `npm run og` to re-render it at 1200x630 through headless Chrome. Set
`CHROME_PATH` if your browser is somewhere unusual.

## Project layout

```
src/
  components/   Landing page sections plus shared form primitives
  pages/        Route-level components
  lib/          Auth, Supabase client, and validation helpers
  index.css     Tailwind layers and shared button classes
public/         Static assets copied to the build root
scripts/        Social preview image generator
```

The `@` import alias points at `src/`, configured in both `vite.config.ts` and
`tsconfig.app.json`.

## Stack

Vite, React 18, TypeScript, Tailwind CSS, React Router, and lucide-react for icons.
Brand colors (`brand`, `cream`, `gold`, `ink`) are defined in `tailwind.config.js`.

## Deploying

The build output is a static site, so any static host works. `public/_redirects`
contains the SPA rewrite rule Netlify needs so client-side routes like `/signup`
resolve on a hard refresh; on other hosts, configure the equivalent catch-all
rewrite to `index.html`.

## Status

Pre-launch. The marketing page, onboarding, login, and confirmation flows are
built and working. Payment collection for the paid tiers is not implemented —
plan selection is captured at signup but nothing is charged.
