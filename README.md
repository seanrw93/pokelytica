# Pokelytica

A Pokémon battle outcome predictor that lets you build two teams, simulate 100 battles between them, and receive AI-powered analysis of the results — including win probabilities, team strengths and weaknesses, and improvement suggestions.

## What it does

You build two teams of up to 6 Pokémon each using a team builder UI. Each Pokémon card lets you select a species, item, ability, nature, and up to 4 moves — with move options filtered to only show moves that Pokémon can actually learn. Once both teams are set, you run a simulation that plays out 100 battles using the Pokémon Showdown battle engine. The results are then sent to an LLM which analyses the matchup and gives you actionable feedback.

## Tech stack

- **Next.js** (App Router, TypeScript) — `apps/web`
- **Koa** (TypeScript) — `apps/api`
- **Prisma** + **Postgres** — `packages/db`, shared by both services
- **Better Auth** — Google/GitHub OAuth + email magic link
- **Tailwind CSS**
- **@pkmn/sim** — Pokémon Showdown's battle engine (runs in `apps/api`)
- **@pkmn/dex** — Pokémon data layer (used by `apps/web`'s dex routes)
- **Groq** (`llama-3.3-70b-versatile`) — battle analysis (runs in `apps/api`)
- **@headlessui/react** — combobox components

## Getting started

### Prerequisites

- Node.js 18+
- A free [Groq API key](https://console.groq.com)

### Installation

```bash
git clone https://github.com/seanrw93/pokelytica.git
cd pokelytica
npm install
```

This is an npm workspaces monorepo — one `npm install` at the root installs dependencies for both services below.

## Services

Pokelytica is split into two services plus a shared database package:

- **`apps/web`** — the Next.js frontend (App Router). Serves the UI, the Pokémon dex data routes, auth (Better Auth), and thin proxy routes (`/api/simulate`, `/api/analyze`) that forward to `apps/api`.
- **`apps/api`** — a Koa service that owns the actual battle simulation (`@pkmn/sim`) and the Groq-powered analysis call, plus tiered usage-quota enforcement on `/analyze`. Only reachable from `apps/web`, not directly from the browser.
- **`packages/db`** — the Prisma schema and generated client, shared by both services.

### Environment variables

Each app has its own `.env` (gitignored) — copy the matching `.env.example` and fill in real values. Variable **names** only, see each `.env.example` for the exact format:

**`apps/web/.env`** (copy from `apps/web/.env.example`):
- `API_URL` — where `apps/api` is running (`http://localhost:4000` locally)
- `INTERNAL_API_SECRET` — shared secret so `apps/api` trusts requests forwarded from this server; must match `apps/api`'s value exactly
- `DATABASE_URL` — Postgres connection string (same database as `apps/api`)
- `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` — Better Auth session signing key and base URL
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` — Google OAuth app credentials
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` — GitHub OAuth app credentials
- `EMAIL_SERVER`, `EMAIL_FROM` — SMTP connection string and from-address used to send magic-link sign-in emails

**`apps/api/.env`** (copy from `apps/api/.env.example`):
- `PORT` — port the Koa service listens on (`4000` locally)
- `GROQ_API_KEY` — your [Groq API key](https://console.groq.com), used for battle analysis
- `DATABASE_URL` — same Postgres connection string as `apps/web`
- `INTERNAL_API_SECRET` — must match `apps/web`'s value exactly

**`packages/db/.env`** (copy from `packages/db/.env.example`):
- `DATABASE_URL` — used by the Prisma CLI (`generate`, `migrate`, `seed`)

### Running locally

Run both services in separate terminals:

```bash
npm run generate -w packages/db  # (one-time) build the Prisma client
npm run dev -w api                # starts the Koa service on :4000
npm run dev -w web                # starts the Next.js app on :3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser. `apps/web` proxies simulation and analysis requests to `apps/api` — both must be running for the team builder to work end to end.

Note: the first simulate request will be slow (~1-2 minutes) as `apps/api` compiles the heavy `@pkmn/sim` dependency on demand. Subsequent requests will be significantly faster.

## How the simulation works

Each of the 100 battles is run server-side using `@pkmn/sim` with `RandomPlayerAI` making move decisions for both sides. After all battles complete, the win/loss/tie counts are tallied and a representative battle log from the final battle is sent to Groq alongside the team compositions and statistics. The LLM then produces a structured analysis covering win probability, strengths, weaknesses, and improvement suggestions.

## Roadmap

- Heuristic AI using `@smogon/calc` for smarter move selection
- EV/IV editor per Pokémon
- Support for more battle formats
- Battle log viewer
- Export team as Showdown paste

## Data

All Pokémon data (species, moves, items, abilities, natures, learnsets) is sourced from the Pokémon Showdown data layer via `@pkmn/dex` and served through local Next.js API routes.

## License

MIT
