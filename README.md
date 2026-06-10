# Radiant Stats

A performance analytics dashboard for competitive FPS game: Valorant. Built with Angular and NestJS.

## Structure

```
apps/
  web/    - Angular frontend
  api/    - NestJS backend (Riot API proxy)
packages/
  shared/ - Shared TypeScript types
```

## Development

```bash
pnpm install

# Start Angular dev server (localhost:4200)
pnpm dev:web

# Start NestJS dev server (localhost:3000)
pnpm dev:api

# Start both
pnpm dev

# Run all tests
pnpm test
```

## Tech Stack

- **Frontend:** Angular 21, Tailwind CSS 4, Spartan UI
- **Backend:** NestJS 11
- **Monorepo:** pnpm workspaces
