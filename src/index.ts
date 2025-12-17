import { Worker } from 'node:worker_threads';
import { cpus } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import type { Config, Statistics, WorkerData } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration with defaults
const config: Config = {
  players: 1_000_000,
  redBalls: 499,
  blueBalls: 1,
};

// Parse CLI arguments
process.argv.slice(2).forEach((arg) => {
  const match = arg.match(/^--(\w+)=(\d+)$/);
  if (match) {
    const [, key, value] = match;
    if (key in config) {
      config[key as keyof Config] = Number(value);
    }
  }
});

const TOTAL_BALLS = config.redBalls + config.blueBalls;
const NUM_WORKERS = cpus().length;

function runWorker(workerData: WorkerData): Promise<number[]> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(join(__dirname, 'worker.js'), { workerData });
    worker.on('message', resolve);
    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker exited with code ${code}`));
      }
    });
  });
}

function calculateStatistics(results: number[]): Statistics {
  const sorted = [...results].sort((a, b) => a - b);
  const sum = results.reduce((acc, val) => acc + val, 0);
  const count = results.length;

  return {
    count,
    min: sorted[0],
    max: sorted[count - 1],
    average: sum / count,
    median:
      count % 2 === 0
        ? (sorted[count / 2 - 1] + sorted[count / 2]) / 2
        : sorted[Math.floor(count / 2)],
    theoretical: TOTAL_BALLS / config.blueBalls,
  };
}

function buildDistribution(results: number[]): Map<number, number> {
  const distribution = new Map<number, number>();
  for (const attempts of results) {
    distribution.set(attempts, (distribution.get(attempts) ?? 0) + 1);
  }
  return new Map([...distribution].sort((a, b) => a[0] - b[0]));
}

function formatOutput(stats: Statistics, distribution: Map<number, number>): void {
  console.log('\n=== SIMULATION RESULTS ===\n');
  console.log(`Players:      ${stats.count.toLocaleString()}`);
  console.log(`Bag size:     ${TOTAL_BALLS} (${config.redBalls} red, ${config.blueBalls} blue)`);
  console.log(`Probability:  1/${TOTAL_BALLS}`);
  console.log(`Workers:      ${NUM_WORKERS}`);

  // The story - setup and results
  console.log('\n--- 📖 L\'Histoire ---');
  console.log(
    `Imagine un sac contenant ${TOTAL_BALLS} boules: ${config.redBalls} 🔴 rouges et ` +
    `${config.blueBalls} 🔵 bleue(s). ${stats.count.toLocaleString()} joueurs vont tenter leur chance.`
  );
  console.log(
    `Chacun pioche une boule au hasard, la remet dans le sac, et recommence ` +
    `jusqu'à tomber sur la boule bleue.`
  );
  console.log(`La probabilité de succès à chaque tirage est de 1/${TOTAL_BALLS}.\n`);

  const luckyCount = distribution.get(1) ?? 0;
  const luckyRatio = stats.count / luckyCount;
  console.log(
    `🍀 Le plus chanceux: ${luckyCount.toLocaleString()} joueur(s) sur ${stats.count.toLocaleString()} ` +
    `ont trouvé la boule bleue du premier coup! (1 sur ${Math.round(luckyRatio).toLocaleString()})`
  );
  console.log(
    `😅 Le plus malchanceux: 1 joueur a dû s'y reprendre ${stats.max.toLocaleString()} fois ` +
    `avant de trouver la boule bleue... soit ${(stats.max / stats.theoretical).toFixed(1)}x ` +
    `plus que la moyenne théorique!`
  );

  // Percentile insights
  const sorted = [...distribution.entries()];
  let cumulative = 0;
  let p50 = 0, p90 = 0, p99 = 0;
  for (const [attempts, count] of sorted) {
    cumulative += count;
    if (!p50 && cumulative >= stats.count * 0.5) p50 = attempts;
    if (!p90 && cumulative >= stats.count * 0.9) p90 = attempts;
    if (!p99 && cumulative >= stats.count * 0.99) p99 = attempts;
  }
  console.log(`\n📊 50% des joueurs ont réussi en ${p50} tentatives ou moins`);
  console.log(`📊 90% des joueurs ont réussi en ${p90.toLocaleString()} tentatives ou moins`);
  console.log(`📊 99% des joueurs ont réussi en ${p99.toLocaleString()} tentatives ou moins`);

  // The moral
  console.log('\n--- 💡 Ce que ça nous apprend ---');
  console.log(
    `✅ Même avec une probabilité de 1/${TOTAL_BALLS}, 100% des joueurs finissent par réussir.`
  );
  console.log(
    `💪 La persévérance bat toujours les statistiques: le malchanceux à ${stats.max.toLocaleString()} ` +
    `tentatives a quand même gagné, comme tous les autres.`
  );
  console.log(
    `⚖️  La différence entre le chanceux (1 tentative) et le malchanceux (${stats.max.toLocaleString()}) ` +
    `est de ${stats.max - 1}x, mais le résultat final est le même: la victoire.`
  );
  console.log(
    `\n🎯 La chance détermine le "quand", pas le "si". Celui qui persévère gagne toujours.`
  );

  console.log('\n--- Statistics ---');
  console.log(`Theoretical:  ${stats.theoretical.toFixed(2)} attempts`);
  console.log(`Average:      ${stats.average.toFixed(2)} attempts`);
  console.log(`Median:       ${stats.median.toFixed(2)} attempts`);
  console.log(`Min:          ${stats.min} attempts`);
  console.log(`Max:          ${stats.max} attempts`);

  console.log('\n--- Distribution (top 20) ---');
  console.log('Attempts → Players (%)');

  const entries = [...distribution.entries()].slice(0, 20);
  for (const [attempts, count] of entries) {
    const percentage = ((count / stats.count) * 100).toFixed(2);
    const bar = '█'.repeat(Math.min(50, Math.round(Number(percentage) * 2)));
    console.log(
      `${String(attempts).padStart(4)} → ${String(count).padStart(8)} (${percentage.padStart(5)}%) ${bar}`
    );
  }

  if (distribution.size > 20) {
    console.log(`... and ${distribution.size - 20} more`);
  }
}

async function main(): Promise<void> {
  console.log('Starting simulation...');
  console.log(`Config: ${config.players.toLocaleString()} players, ${TOTAL_BALLS} balls in bag`);
  console.log(`Using ${NUM_WORKERS} worker threads`);

  const startTime = performance.now();

  // Distribute work across workers
  const playersPerWorker = Math.floor(config.players / NUM_WORKERS);
  const remainder = config.players % NUM_WORKERS;

  const workerPromises: Promise<number[]>[] = [];

  for (let i = 0; i < NUM_WORKERS; i++) {
    const count = playersPerWorker + (i < remainder ? 1 : 0);
    workerPromises.push(
      runWorker({
        startIndex: i * playersPerWorker,
        count,
        totalBalls: TOTAL_BALLS,
        blueBalls: config.blueBalls,
      })
    );
  }

  const workerResults = await Promise.all(workerPromises);
  const results = workerResults.flat();

  const elapsed = performance.now() - startTime;
  console.log(`Simulation time: ${elapsed.toFixed(2)}ms`);

  const stats = calculateStatistics(results);
  const distribution = buildDistribution(results);

  formatOutput(stats, distribution);
}

main().catch(console.error);
