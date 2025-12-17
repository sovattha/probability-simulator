# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Simulation de probabilites qui illustre la variance dans les jeux de hasard. Des millions de joueurs piochent des boules dans un sac jusqu'a obtenir la boule bleue (probabilite 1/500).

**Ce que la simulation demontre:**
- Parmi 1 million de joueurs, certains chanceux trouvent la boule bleue du premier coup
- D'autres malchanceux doivent s'y reprendre des milliers de fois (10x+ la moyenne theorique)
- La mediane est souvent bien inferieure a la moyenne (distribution geometrique)
- Les percentiles (50%, 90%, 99%) montrent l'inegalite des resultats

## Tech Stack

- **TypeScript** + ES Modules
- **Node.js Worker Threads** (parallelisme natif, zero dependance externe)
- Build: `tsc` vers `dist/`

## Commands

```bash
npm install          # Install dev dependencies
npm run build        # Compile TypeScript
npm start            # Run simulation (1M players default)
npm run dev          # Build + run

# Custom configuration
npm start -- --players=100000 --redBalls=99 --blueBalls=1
```

## CLI Arguments

- `--players=N` - Nombre de simulations (default: 1,000,000)
- `--redBalls=N` - Boules rouges dans le sac (default: 499)
- `--blueBalls=N` - Boules bleues dans le sac (default: 1)

## Architecture

```
src/
  index.ts   # Main: CLI parsing, worker orchestration, statistics, output
  worker.ts  # Worker thread: runs N simulations in parallel
  types.ts   # TypeScript interfaces
```

Key functions:
- `runWorker()` - Spawns a worker thread with config
- `calculateStatistics()` - Computes average, median, min/max
- `buildDistribution()` - Aggregates results into attempt counts
- `formatOutput()` - Displays results with storytelling (chanceux/malchanceux)
