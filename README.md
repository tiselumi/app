# Tiselumi

Tiselumi is a calm sound mixer for people who need help winding down before sleep. This repository contains the browser-based MVP.

## MVP scope

- Curated, properly licensed ambient sounds.
- A simple mixer with independent volume controls.
- Background playback with system play, pause, and stop controls when supported by the browser.
- Sleep timer and gentle fade-out.
- Saved preferences and named soundscapes stored locally in the browser for guests.
- Optional Google account login and Supabase synchronization for named soundscapes. Guest mixes are moved into the account after the first successful login.
- Removed account soundscapes use soft deletion so synchronized devices retain a deletion tombstone and do not restore stale cached copies.
- No AI generation, analytics, payments, notifications, or medical claims.

## Tech stack

- React 19 and TypeScript.
- Vite for local development and production builds.
- Tailwind CSS for styling.
- Vitest and Testing Library for tests.
- Oxlint and Prettier for code quality.
- Static hosting on Cloudflare Pages or another compatible provider.

## Getting started

Requirements: Node.js 24 or newer and npm 11. Copy `.env.example` to `.env.local` and add
your Supabase project URL and publishable key to enable account login.

```bash
npm ci
npm run dev
```

Open the local address printed by Vite.

## Commands

| Command             | Purpose                                  |
| ------------------- | ---------------------------------------- |
| `npm run dev`       | Start the development server.            |
| `npm run format`    | Format supported files.                  |
| `npm run lint`      | Run static analysis.                     |
| `npm run typecheck` | Check TypeScript types.                  |
| `npm run test`      | Run the test suite once.                 |
| `npm run build`     | Create the production bundle in `dist/`. |
| `npm run check`     | Run every required pre-merge check.      |

## Deployment

For Cloudflare Pages, use `npm run build` as the build command and `dist` as the output directory.
Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` as build environment variables.

## Supabase setup

The repository contains a local Supabase configuration and a migration for the `mixes` table.
Link it to an existing Supabase project and push the migration when you are ready:

```bash
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase db push
```

In the Supabase dashboard, enable the Google auth provider and add the production site URL plus
the local development URL to the allowed redirect URLs. Keep the service-role key out of the app;
the browser uses only the publishable key and database access is protected by Row Level Security.

For a GitHub Pages deployment at `https://tiselumi.github.io/app/`, use
`https://tiselumi.github.io` as Google's authorized JavaScript origin and the full
`https://tiselumi.github.io/app/` URL in Supabase's Site URL and redirect allow list.

## Contributing

Read [AGENTS.md](./AGENTS.md) before making changes. Keep pull requests focused, include tests where behavior changes, and run `npm run check` before requesting review.

This project is private and does not currently include an open-source license.
