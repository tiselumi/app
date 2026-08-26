# AGENTS.md

This file defines the working agreement for everyone who changes the Tiselumi application, including human contributors and coding agents.

## Product principles

- Tiselumi is a calm, browser-based sound mixer that helps people wind down before sleep.
- The current MVP is intentionally client-only. Do not add accounts, a backend, AI generation, analytics, payments, or notifications unless the product scope is explicitly changed.
- Treat the product as a wellbeing aid, not a medical device. Never promise to diagnose, treat, or cure anxiety, insomnia, or another condition.
- Favor a quiet, simple experience over feature count. Avoid attention-grabbing patterns, streaks, urgency, and unnecessary notifications.
- A visitor understands the app within seconds of arriving: one screen offers one obvious next action (pick a mood, press play) with no explanation needed.
- Keep interfaces uncluttered. No fine print or label noise; reveal detailed controls only at the moment they are needed.
- If a feature or screen requires instructions to be understood, redesign it or cut it.

## Required workflow

1. Read this file, `README.md`, and the relevant code before editing.
2. Keep each change focused on one problem. Do not mix unrelated cleanup into feature work.
3. Use the existing Node.js and npm versions. Commit `package-lock.json` whenever dependencies change.
4. Prefer platform APIs and existing dependencies. Add a dependency only when its value, maintenance status, bundle cost, and license justify it.
5. Add or update tests for behavior changes and regression fixes.
6. Run `npm run check` before handing work off or requesting review.

## Canonical commands

- Install dependencies: `npm ci`
- Start development: `npm run dev`
- Format files: `npm run format`
- Check formatting: `npm run format:check`
- Lint code: `npm run lint`
- Check types: `npm run typecheck`
- Run tests: `npm run test`
- Build production assets: `npm run build`
- Run every required check: `npm run check`

Do not claim a change is complete when a required check is failing. If a check cannot run, report the exact command, the blocker, and what remains unverified.

## Architecture and code quality

- Use TypeScript in strict mode. Do not introduce `any`, unchecked type assertions, or non-null assertions without a documented reason.
- Build React function components with small, explicit interfaces. Keep rendering pure and place browser side effects in hooks or services.
- Use the `@/` alias for cross-folder imports. Use relative imports within a small local feature.
- Organize growing functionality by product feature. Keep reusable UI, domain logic, browser integrations, and static assets separate.
- Keep audio state and Web Audio API integration outside presentational components.
- Prefer clear duplication over a premature abstraction. Extract shared code only after its stable responsibility is understood.
- Delete dead code and generated demo assets. Do not commit `dist`, coverage output, caches, or local environment files.

## React and accessibility

- Use semantic HTML before ARIA. Every interactive control must be keyboard accessible and have an accessible name.
- Maintain visible focus states, sufficient contrast, and comfortable pointer targets.
- Design mobile-first and verify narrow and wide layouts.
- Respect `prefers-reduced-motion`. Motion must never be required to understand or operate the interface.
- Announce meaningful asynchronous state changes to assistive technology without creating noise.
- Avoid autoplay. Audio must begin only after an explicit user action.

## Styling

- Use Tailwind CSS utilities for component styling and CSS custom properties for stable design tokens.
- Reuse spacing, color, radius, and typography decisions. Avoid repeated arbitrary values when a token or component is appropriate.
- Do not add inline styles unless a value is genuinely dynamic and cannot be expressed safely with existing utilities.
- Preserve the calm visual language and test changes in both supported color schemes if dark mode is introduced.

## Audio requirements

- Start or resume audio only in response to a user gesture and handle browsers that suspend an audio context.
- Clean up timers, event listeners, sources, gain nodes, and audio contexts when their owner is disposed.
- Use smooth gain ramps for volume changes and fade-outs to prevent audible clicks.
- Handle looping, pausing, tab visibility changes, interruptions, and mobile browser behavior deliberately.
- Keep bundled files compressed and small enough for a fast first load. Lazy-load audio that is not immediately needed.
- Accept only sounds with a license that permits the intended use. Record the source, author, license, and any attribution requirement alongside every asset.

## Testing

- Test user-visible behavior with Vitest and Testing Library. Prefer accessible queries such as role and label.
- Keep tests deterministic. Mock browser APIs only at their boundaries and do not test implementation details.
- Every bug fix must include a regression test when the behavior can be tested automatically.
- Manually verify audio behavior on at least one Chromium browser and one mobile browser before a release that changes playback.

## Security, privacy, and content

- Never commit secrets, credentials, private keys, personal data, or production environment values.
- Treat all external input and persisted browser data as untrusted. Validate it before use and fail safely.
- Collect no personal data by default. Any future analytics or storage must have a documented purpose, consent model, retention policy, and deletion path.
- Do not add third-party scripts without reviewing their privacy impact, security posture, and performance cost.
- Do not commit copyrighted, scraped, or license-ambiguous audio, images, fonts, or text. AI-generated content must also have documented provenance and usage rights.
- Keep dependencies current and resolve high-severity security findings before release.

## Git and pull requests

- Keep `main` releasable. Work in short-lived branches named `feat/<topic>`, `fix/<topic>`, `docs/<topic>`, or `chore/<topic>`.
- Keep commits small and coherent. Separate unrelated changes rather than hiding them in one commit.
- Use pull requests for review, require CI to pass, and prefer squash merging.
- Do not force-push, rewrite shared history, or commit directly to protected branches.
- Explain the outcome, notable decisions, verification, accessibility impact, and asset licenses in the pull request.

## Commit messages

Write commit messages in English using the project's Conventional Commit style. Use one of these types:

- `feat`: add or change user-facing functionality.
- `fix`: correct a defect. Use `fix`, never `bug`, as the commit type.
- `perf`: improve performance without changing intended behavior.
- `docs`: change documentation only.
- `style`: change formatting only, with no behavior change.
- `refactor`: restructure code without adding a feature or fixing a defect.
- `test`: add or change tests only.
- `build`: change dependencies or build tooling.
- `ci`: change continuous integration configuration.
- `chore`: perform repository maintenance not covered above.

For one logical change, use:

```text
type: short imperative description
```

Examples:

```text
feat: add independent volume controls
fix: stop the sleep timer after playback ends
docs: document sound asset licensing
```

For several closely related changes that must remain in one commit, use:

```text
type:

- first concrete change;
- second concrete change;
- final concrete change.
```

Use lowercase types, no scope, no emoji, and no trailing period in a single-line subject. Describe what changed, not the work process. Breaking changes require explicit maintainer approval and a `BREAKING CHANGE:` footer.

## Definition of done

A change is ready only when:

- The requested behavior is complete and unnecessary scope was not added.
- Code, content, and asset licensing follow this agreement.
- Accessibility and responsive behavior were considered and manually checked when relevant.
- Tests cover new or corrected behavior.
- `npm run check` passes.
- Documentation and configuration are updated where needed.
- The pull request and commit message clearly describe the result.
