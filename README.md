# Tiselumi

Tiselumi is a calm sound mixer for people who need help winding down before sleep. This repository contains the browser-based MVP.

## MVP scope

- Curated, properly licensed ambient sounds.
- A simple mixer with independent volume controls.
- Background playback with system play, pause, and stop controls when supported by the browser.
- Sleep timer and gentle fade-out.
- Saved preferences and named soundscapes stored locally in the browser. Guest mixes include selected sounds and their volumes; delete them using the × button beside a saved mix. No data is sent to a server. Mixes remain until deleted or browser site data is cleared; private browsing may discard them at the end of the session.
- No accounts, backend, AI generation, analytics, or medical claims.

## Tech stack

- React 19 and TypeScript.
- Vite for local development and production builds.
- Tailwind CSS for styling.
- Vitest and Testing Library for tests.
- Oxlint and Prettier for code quality.
- Static hosting on Cloudflare Pages or another compatible provider.

## Getting started

Requirements: Node.js 24 or newer and npm 11.

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

For Cloudflare Pages, use `npm run build` as the build command and `dist` as the output directory. No runtime environment variables are required for the initial MVP.

## Contributing

Read [AGENTS.md](./AGENTS.md) before making changes. Keep pull requests focused, include tests where behavior changes, and run `npm run check` before requesting review.

This project is private and does not currently include an open-source license.
