# Pokelytica

A Pokémon battle outcome predictor that lets you build two teams, simulate 100 battles between them, and receive AI-powered analysis of the results — including win probabilities, team strengths and weaknesses, and improvement suggestions.

## What it does

You build two teams of up to 6 Pokémon each using a team builder UI. Each Pokémon card lets you select a species, item, ability, nature, and up to 4 moves — with move options filtered to only show moves that Pokémon can actually learn. Once both teams are set, you run a simulation that plays out 100 battles using the Pokémon Showdown battle engine. The results are then sent to an LLM which analyses the matchup and gives you actionable feedback.

## Tech stack

- **Next.js** (App Router, TypeScript)
- **Tailwind CSS**
- **@pkmn/sim** — Pokémon Showdown's battle engine
- **@pkmn/dex** — Pokémon data layer
- **@smogon/calc** — damage calculator
- **Groq** (`llama-3.3-70b-versatile`) — battle analysis
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

### Environment variables

Create a `.env.local` file in the root of the project:

```
GROQ_API_KEY=your_groq_api_key_here
```

### Running locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

Note: the first request to the simulate endpoint will be slow in dev mode (~1-2 minutes) as Next.js compiles the heavy `@pkmn/sim` dependency on demand. Subsequent requests will be significantly faster.

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
