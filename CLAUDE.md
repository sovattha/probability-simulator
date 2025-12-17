# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Node.js probability simulation that models players picking balls from a bag until they get a blue ball. It uses parallel computing to run millions of simulations concurrently and aggregates results to show the distribution of attempts needed.

## Commands

```bash
# Install dependencies
npm install

# Run the simulation
node index.js
```

## Architecture

Single-file simulation (`index.js`) using:
- **paralleljs**: Distributes the simulation across multiple threads
- **PLAYERS constant**: Controls how many parallel simulations to run (default: 10 million)
- **Bag configuration**: 499 red balls + 1 blue ball (1/500 probability)

The simulation outputs a distribution map showing how many players needed N attempts to find the blue ball.
