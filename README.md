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

## Routes

| Path | Page | Notes |
| --- | --- | --- |
| `/` | `src/pages/LandingPage.tsx` | Composes the marketing sections |
| `/signup` | `src/pages/Onboarding.tsx` | Four-step role, interests, and plan flow |
| `/login` | `src/pages/Login.tsx` | Login form |

## Project layout

```
src/
  components/   Landing page sections (Hero, Pricing, Footer, ...)
  pages/        Route-level components
  index.css     Tailwind layers and shared button classes
public/         Static assets copied to the build root
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

The signup, login, and onboarding forms are currently UI only — they do not submit
anywhere yet. `@supabase/supabase-js` is installed but not yet wired up.
