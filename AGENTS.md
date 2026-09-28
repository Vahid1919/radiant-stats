# Radiant Stats Agent Guide

## Project

Radiant Stats is a single SvelteKit application for Valorant performance analytics. It uses TypeScript, Svelte 5, Tailwind CSS 4, Vitest, and the Node adapter. Keep changes focused; do not introduce a separate frontend or API service.

`pnpm-lock.yaml` is authoritative. Use `pnpm`, not npm or Yarn, and update the lockfile only when dependencies change.

## Repository Map

- `src/routes`: file-based pages, layouts, load functions, and HTTP handlers.
- `src/lib/components`: reusable Svelte components.
- `src/lib`: shared domain types, data, and pure helpers.
- `src/lib/server`: server-only clients, secrets, and external API integration.
- `static`: assets served without transformation.
- `tests`: Vitest tests.
- `.svelte-kit` and `build`: generated output; never edit these files.

## Commands

Run commands from the repository root.

```bash
pnpm install          # Install dependencies
pnpm dev              # Start Vite on http://localhost:5173
pnpm check            # Run svelte-check and TypeScript checks
pnpm lint             # Run ESLint
pnpm format:check     # Verify Prettier formatting
pnpm test             # Run the Vitest suite once
pnpm build            # Create the adapter-node production build
```

For a focused test, run `pnpm vitest run tests/<file>.test.ts`. Do not use watch mode in automated work.

## Working Method

1. Read the owning implementation and the nearest relevant test or call site before editing.
2. Follow an existing local pattern unless the task explicitly requires a new one.
3. Make the smallest change that resolves the root cause. Avoid unrelated refactors, dependency changes, and generated-file churn.
4. Add or update tests for behavior changes. Test observable behavior and important failure cases rather than implementation details.
5. Run the narrowest relevant check immediately after editing. Before finishing a code change, run `pnpm check`, `pnpm lint`, `pnpm format:check`, and `pnpm test`; also run `pnpm build` for routing, server, dependency, or production-rendering changes.
6. Report the commands run and any validation that could not be completed. Do not claim a check passed unless it was executed.

Preserve user-authored work already present in the worktree. Do not commit, push, or rewrite git history unless explicitly asked.

## Learning And Agent Workflows

This is a learning-focused project. For every interaction and change, load and follow [the engineering mentor skill](.github/skills/engineering-mentor/SKILL.md). Use its adaptive pacing to keep urgent work efficient, but always explain decisions at the appropriate level, build durable understanding, and incorporate active recall or a concise retrospective when useful.

## TypeScript

- Keep strict typing. Never add `any`, `@ts-ignore`, or broad type assertions to silence an error; use `unknown` and narrow it.
- Prefer inferred local types and explicit types at component props, exported functions, server boundaries, and external-data boundaries.
- Use `import type` for type-only imports and the generated SvelteKit types from `./$types` in route modules.
- Model finite domain values with literal unions or `as const`. Use `satisfies` when validating a value while preserving inference.
- Keep shared domain types and pure helpers in `src/lib`; keep route-specific logic beside its route.

## Svelte 5

- Use runes syntax in new and modified components. Type props with `$props<Props>()`.
- Use `$state` only for mutable reactive state and `$derived` for computed values. Do not mirror derivable state or use `$effect` for pure computation.
- Use modern event attributes such as `onclick`, callback props for component events, and snippets with `{@render}` instead of legacy event directives, `createEventDispatcher`, and slots.
- Keep components small and focused. Extract a component when it has a distinct responsibility or meaningful reuse, not merely to reduce line count.
- Keep SSR in mind: do not access `window`, `document`, or browser storage during server rendering. Use browser guards or lifecycle code when browser access is required.
- Prefer semantic markup and CSS/Tailwind state variants over JavaScript-driven presentation state.

## SvelteKit Boundaries

- Put pages and layouts in `+page.svelte` and `+layout.svelte`; put request handlers in `+server.ts`.
- Use `+page.server.ts` or `+layout.server.ts` when data needs secrets, privileged access, or server-only modules. Use universal load functions only when they are safe in both environments.
- Put external API clients and secret-bearing logic in `$lib/server`. Never import `$lib/server` modules into browser code.
- Server-side code should call shared server modules directly. Do not call this application's own HTTP endpoints from server load functions or server handlers.
- Validate route parameters, request bodies, environment variables, and external API responses at their boundaries. Return intentional HTTP errors; do not leak upstream payloads or secrets.
- Prefer private `$env/static/private` or `$env/dynamic/private` imports for secrets. Never expose Riot tokens through `PUBLIC_` variables, page data, logs, tests, or client bundles.

## UI And Accessibility

- Preserve the existing Valorant visual language and responsive behavior unless the task requests a redesign.
- Meet WCAG AA contrast. Use semantic HTML, associated labels, meaningful image alternatives, and keyboard-operable controls.
- Provide visible `:focus-visible` states. Do not remove focus outlines without an accessible replacement.
- Respect `prefers-reduced-motion`; avoid making motion the only way information is communicated.
- Check changed UI at narrow mobile and desktop widths. Prevent overflow, overlap, layout shift, and clipped text.

## Tests

- Use Vitest and place tests under `tests` with `*.test.ts` names.
- Keep tests deterministic and independent of network access, wall-clock timing, and test order.
- Mock external Riot API boundaries; do not use real credentials or production services in tests.
- For endpoint tests, verify status, important headers, response shape, and error behavior as applicable.
