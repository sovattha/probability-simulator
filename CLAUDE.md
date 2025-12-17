# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Node.js probability simulation that models players picking balls from a bag until they get a blue ball. It uses parallel computing to run millions of simulations concurrently and outputs statistics and distribution of attempts needed.

## Commands

```bash
# Install dependencies
npm install

# Run the simulation (default: 1M players, 500 balls)
node index.js

# Run with custom configuration
node index.js --players=100000 --redBalls=99 --blueBalls=1
```

## CLI Arguments

- `--players=N` - Number of simulations to run (default: 1,000,000)
- `--redBalls=N` - Number of red balls in bag (default: 499)
- `--blueBalls=N` - Number of blue balls in bag (default: 1)

## Architecture

Single-file simulation (`index.js`) using **paralleljs** to distribute work across CPU cores.

Key functions:
- `buildSimulationFunction()` - Creates the worker function with embedded config (required because paralleljs serializes functions)
- `calculateStatistics()` - Computes average, median, min/max from results
- `buildDistribution()` - Aggregates results into attempt counts
- `formatOutput()` - Displays formatted results with histogram
