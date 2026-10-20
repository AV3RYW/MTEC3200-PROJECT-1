<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project Instructions

Read this file and the root [`PRD.md`](../PRD.md) before each task. Implement only features that support the PRD; ask before expanding the MVP.

## About This Project

Puzzle Alarm is a browser-based morning alarm that asks the user to solve a short puzzle before dismissing the alarm, helping them engage with their morning rather than snoozing automatically.

## Stack and Dependencies

- Next.js 16.3.5 with the App Router, React 19.2.8, and TypeScript 5.9.3.
- Tailwind CSS 4.3.3, integrated through `@tailwindcss/postcss` 4.3.3.
- ESLint 9.39.5 with `eslint-config-next` 16.3.5.
- Node.js type definitions 20.19.43 and React/React DOM type definitions 19.3.0.
- No component library, database, or application API is currently installed or configured. Prefer existing platform and project capabilities; ask before adding dependencies.
- Use browser APIs such as local storage, timers, and audio only where they fit the PRD and account for browser/device restrictions.

## Commands

- Install dependencies: `npm install`
- Start development: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- There is no test script currently defined in `package.json`.

## Product Scope

- The MVP has a home screen, alarm settings, and an active alarm/puzzle experience.
- Support one saved recurring alarm without an account. Let the user configure its time, repeat days (no selected days means one-time), difficulty (easy, medium, hard), and enabled state.
- Persist alarm settings in the same browser so they remain after refresh or reopening it.
- Require a correct puzzle answer to dismiss a ringing alarm. Incorrect answers must keep it active and allow another attempt. Provide an explicit emergency stop; it is not a successful puzzle completion.
- After dismissal, give brief, neutral feedback about whether dismissal was within the on-time window. The PRD proposes five minutes as a prototype value, not a settled product decision.
- Explain that a web alarm is not guaranteed when the browser is closed, the device is asleep, or background execution is restricted. Do not imply guaranteed waking, health benefits, or improved punctuality.
- Keep the experience understandable on narrow mobile screens and usable with keyboard navigation.
- Do not add accounts, cloud sync, social features, sleep tracking, streaks, guilt-based feedback, AI-generated puzzles, or native-app/background-alarm guarantees; these are outside MVP scope.

## Code Style

- Use TypeScript and the existing Next.js App Router structure.
- Keep components focused, with one component per file where practical. Put reusable components in `components/` and app routes in `app/`.
- Use the existing Tailwind CSS setup for styling; avoid separate CSS files and arbitrary sizing values when suitable utilities exist.
- Use clear, descriptive names and semantic, accessible controls. Include keyboard interaction and visible focus states.
- Keep browser-only APIs in client-side code; do not access `window`, local storage, or audio APIs during server rendering.
- Preserve the existing project conventions and avoid introducing abstractions or dependencies without a clear need.

## Working Rules

- Read the PRD before implementing a feature and keep the implementation within its MVP scope.
- Do not change working screens unless the task requires it.
- Build and verify one screen or user flow at a time.
- Do not commit `.env.local`, credentials, or API keys.
- Update relevant documentation when behavior or setup changes.
- Keep explanations short and accessible to a student with limited coding experience. State which files you changed and stop for manual testing when the task is complete.
