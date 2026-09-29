# Radiant Stats

Radiant Stats is a SvelteKit dashboard for exploring a Valorant player's competitive performance. Enter a Riot ID in the form `NAME#TAG` to view the player's profile, available competitive match history, summary metrics, and performance trends.

## Quick start

### Requirements

- Node.js 20 or newer
- pnpm
- A HenrikDev API key

### Install and configure

```bash
pnpm install
```

Create `.env.local` in the project root:

```dotenv
VALORANT_API_KEY=your_henrikdev_api_key
```

The key is used only by server-side code. Do not prefix it with `PUBLIC_` or commit `.env.local`.

### Run locally

```bash
pnpm dev
```

Open `http://localhost:5173`, search for a Riot ID, and select the matching player.

## How it works

1.  The home page validates the `NAME#TAG` input and requests the player's profile through `/api/players/[name]/[tag]`.
2.  The server-only HenrikDev adapter validates the provider response and maps it to application-owned types.
3.  The dashboard route loads the profile and competitive match data on the server.
4.  `buildCompetitivePerformance()` calculates summary metrics and chart data for the page.

The HenrikDev API key never reaches the browser. Dashboard results are cached in memory for 15 minutes. Competitive history is fetched in pages of 20, up to 100 available matches. The provider's available history is not necessarily a player's complete career history.

## Dashboard data

The player page includes:

- Player profile and account details
- Win/loss record, win rate, K/D, KDA, ACS, ADR, and headshot percentage
- Most-played agent and map
- Match history with map, agent, score, result, and per-match statistics
- ACS, headshot percentage, KDA, and First Blood Rate trend charts

First Blood Rate is calculated per 100 rounds. The chart also shows a five-match rolling average when enough data is available. Matches without first-blood data are excluded from that calculation.

## Project structure

```text
src/
  lib/
    components/                        Shared Svelte components
    player-dashboard.ts                 Dashboard types and metric calculations
    player-profile.ts                   Profile type
    server/valorant/henrik-client.ts    Server-only HenrikDev adapter
  routes/
    +page.svelte                        Search page
    api/                                Profile and health endpoints
    players/[name]/[tag]/               Dashboard route
tests/                                  Vitest tests
static/images/                         Agent and application images
docs/learning/                         Project learning notes
```

## Routes

| Route                       | Purpose                                 |
| --------------------------- | --------------------------------------- |
| `/`                         | Search for a player                     |
| `/players/[name]/[tag]`     | Render a player's dashboard             |
| `/api/players/[name]/[tag]` | Return profile JSON for the search flow |
| `/api/health`               | Health check                            |

## Validation

Tests use mocked provider responses and do not call HenrikDev.

```bash
pnpm check
pnpm lint
pnpm format:check
pnpm test
pnpm build
```

Run the development server with `pnpm dev` or preview a production build with:

```bash
pnpm build
pnpm preview
```
