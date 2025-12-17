# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Interactive probability simulator that demonstrates statistics through storytelling. Available as:
- **Web app** (`app.html`) - No installation, runs in browser, bilingual FR/EN
- **CLI** (Node.js) - For large-scale simulations with multi-threading

**What the simulation demonstrates:**
- Geometric vs uniform distributions
- Variance and expected value in games of chance
- How pity systems, streaks, and competition mechanics work
- The gambler's fallacy and probability independence

## Quick Start

**Web app (recommended):**
```bash
open app.html  # Just open in browser, that's it!
```

**CLI version:**
```bash
npm install && npm run build && npm start
```

## Tech Stack

- **Web app**: Pure HTML/CSS/JavaScript + Chart.js
- **CLI**: TypeScript + ES Modules + Node.js Worker Threads
- Build: `tsc` to `dist/`

## Files

```
app.html           # Interactive web app (7 modes, bilingual)
src/
  index.ts         # CLI: argument parsing, worker orchestration, output
  worker.ts        # Worker thread: simulation logic
  html-output.ts   # HTML report generator
  types.ts         # TypeScript interfaces
```

## CLI Commands

```bash
npm install          # Install dev dependencies
npm run build        # Compile TypeScript
npm start            # Run simulation (1M players default)
npm run dev          # Build + run

# Custom configuration
npm start -- --players=100000 --redBalls=99 --blueBalls=1 --withReplacement=false --output=html
```

## CLI Arguments

| Argument | Default | Description |
|----------|---------|-------------|
| `--players` | 1,000,000 | Number of simulations |
| `--redBalls` | 499 | Red balls in bag |
| `--blueBalls` | 1 | Blue balls in bag |
| `--withReplacement` | true | Put ball back after draw |
| `--output` | console | `console` or `html` |

## Web App Modes

1. **With replacement** - Geometric distribution
2. **Without replacement** - Uniform distribution, guaranteed max
3. **Pity System** - Gacha mechanics simulation
4. **Competition** - Turn order advantage
5. **Streaks** - Hot/cold hand (gambler's fallacy)
6. **Economy** - Cost vs reward, expected value
7. **Multi-target** - Find N balls, variance scaling
