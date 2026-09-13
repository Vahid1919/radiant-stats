# Radiant Stats

A Valorant performance analytics dashboard built as one SvelteKit application.

## Architecture

Svelte components in `src/lib/components` render the interface. Pages live in `src/routes`; server endpoints use the same route tree, keeping browser and server responsibilities explicit without a separate API process.

```
src/
  lib/agents.ts                 Shared agent domain data and image URL helper
  lib/components/               Reusable Svelte UI components
  routes/+page.svelte           Homepage
  routes/api/health/+server.ts  Example JSON server endpoint
static/images/                  Logo and agent artwork
```

Future Riot API code belongs in `src/lib/server/`. That directory is server-only: keep access tokens in private environment variables and never import them into browser components.

## Development

```bash
pnpm install
pnpm dev
```

The development server runs at `http://localhost:5173`. The API example is available at `http://localhost:5173/api/health`.

## Commands

```bash
pnpm check         # Type-check Svelte and TypeScript
pnpm lint          # Lint application code
pnpm format:check  # Check formatting
pnpm test          # Run unit tests
pnpm build         # Create a Node production build
pnpm start         # Run the production build on port 3000
```

## Learning Path

1. Start with a component in `src/lib/components` and its typed props.
2. Inspect `src/routes/api/health/+server.ts` to see a request handler return JSON.
3. Add validated input to a new endpoint.
4. Build a Riot client in `src/lib/server/` after obtaining API access.
