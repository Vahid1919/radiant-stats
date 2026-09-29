# Agent Instructions

These instructions apply to the Radiant Stats repository. More specific
`AGENTS.md` files may exist in subdirectories; when present, their rules take
precedence for files in those directories.

## Project Context

- Framework: SvelteKit with Svelte 5 runes and TypeScript.
- Package manager: pnpm.
- Data provider: HenrikDev Valorant API.
- Tests: Vitest with mocked provider responses.
- Runtime configuration: `VALORANT_API_KEY` in `.env.local`.

The application searches for a Riot ID, loads a server-side player dashboard,
and calculates competitive performance metrics from normalized provider data.
The provider's available match history is limited and should not be described
as a complete career history.

## Core Principles

1. **Type-safe**: keep TypeScript strict, do not use `any`, and narrow
   `unknown` at external boundaries.
2. **Validate input**: treat Riot IDs, environment variables, network responses,
   and HenrikDev JSON as untrusted until validated by the owning module.
3. **Keep secrets private**: use `$env/dynamic/private` only in server-side
   modules. Never expose `VALORANT_API_KEY` to Svelte components or the client
   bundle.
4. **Test changed behavior**: add or update focused Vitest tests for changed
   calculations, provider mapping, pagination, caching, routes, or errors.
5. **Preserve isolation**: ensure in-memory caches and request data do not leak
   between different player lookups.

When a principle conflicts with an executable check, enforced policy, or a more
specific instruction, the more specific mechanism is authoritative. Report the
discrepancy rather than silently choosing between conflicting rules.

## Sources of Truth

- When documentation conflicts with working code or configuration, implement
  against the code and report the stale document.
- When a structure document conflicts with the file tree, use the file tree and
  report the stale document.
- When agent instructions conflict, follow the most specific applicable file and
  report the conflict.

## Agent Behavior and Approval Boundaries

- Ask clarifying questions before editing when requirements are ambiguous.
- Prefer small, focused changes over broad refactors.
- Do not add dependencies without explaining the need and first considering what
  the existing project already provides.
- Do not change public behavior, routes, environment variables, or data
  contracts unless the user explicitly requests it.
- Call out risks and required tests when modifying security-sensitive code.
- Never commit, amend, rebase, push, or open a pull request without explicit
  user approval.
- Treat approval to edit files separately from approval for Git operations.
- Before an approved Git operation, show the exact command or commit plan and
  the changes it affects.
- Before editing three or more files, migrations, security boundaries, or public
  interfaces, show a plan and wait for explicit approval.

## Project Conventions

### Server and provider boundary

- Keep HenrikDev calls, response parsing, API-key access, pagination, and
  dashboard caching in `src/lib/server/valorant/henrik-client.ts`.
- Do not pass raw HenrikDev responses into UI components. Map them to the
  application-owned types in `src/lib/player-profile.ts` and
  `src/lib/player-dashboard.ts`.
- Keep pure metric aggregation in `src/lib/player-dashboard.ts` so it can be
  tested without a network request.
- Preserve the current behavior of fetching up to 100 available competitive
  matches in pages and using the existing 15-minute in-memory cache unless the
  user asks for a contract change.

### Svelte and routes

- Follow existing Svelte 5 rune patterns and component structure.
- Keep page loading and HTTP error mapping in the route server files; keep UI
  rendering and browser interaction in `.svelte` files.
- Preserve the existing routes and URL parameter conventions unless the user
  explicitly requests a route change.
- Maintain accessible labels, keyboard interaction, loading states, error
  states, and empty states when changing UI behavior.

### Documentation and generated files

- Keep `README.md` aligned with the current scripts, routes, data limits, and
  environment setup.
- Do not edit `build/` or other generated output as part of normal source
  changes.
- Do not commit `.env.local`, API keys, or provider response dumps.

## Working Method

- Discover the language, framework, package manager, runtime, and validation
  commands from repository manifests and configuration before relying on them.
- Follow established local patterns before introducing a new abstraction or
  style.
- Keep shared domain types and pure logic close to their owning domain module.
- Use the narrowest useful validation first, then run broader checks when the
  change affects shared behavior.
- Report validation commands, results, and remaining uncertainty at handoff.

## Validation Commands

Run the narrowest relevant check first, then use the full suite when the change
crosses module boundaries:

```bash
pnpm check
pnpm lint
pnpm format:check
pnpm test
pnpm build
```

Tests are deterministic and should not call HenrikDev. Use mocked `fetch`
responses for provider behavior.
