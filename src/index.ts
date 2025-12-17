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
  withReplacement: true,
};

// Parse CLI arguments
process.argv.slice(2).forEach((arg) => {
  const matchNum = arg.match(/^--(\w+)=(\d+)$/);
  const matchBool = arg.match(/^--(\w+)=(true|false)$/);

  if (matchNum) {
    const [, key, value] = matchNum;
    if (key in config && key !== 'withReplacement') {
      (config as unknown as Record<string, number>)[key] = Number(value);
    }
  } else if (matchBool) {
    const [, key, value] = matchBool;
    if (key === 'withReplacement') {
      config.withReplacement = value === 'true';
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

  // Theoretical average depends on mode
  let theoretical: number;
  if (config.withReplacement) {
    // Geometric distribution: E[X] = 1/p = totalBalls/blueBalls
    theoretical = TOTAL_BALLS / config.blueBalls;
  } else {
    // Without replacement: E[X] = (totalBalls + 1) / (blueBalls + 1)
    theoretical = (TOTAL_BALLS + 1) / (config.blueBalls + 1);
  }

  return {
    count,
    min: sorted[0],
    max: sorted[count - 1],
    average: sum / count,
    median:
      count % 2 === 0
        ? (sorted[count / 2 - 1] + sorted[count / 2]) / 2
        : sorted[Math.floor(count / 2)],
    theoretical,
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
  const modeLabel = config.withReplacement ? 'avec remise' : 'sans remise';

  console.log('\n=== SIMULATION RESULTS ===\n');
  console.log(`Players:      ${stats.count.toLocaleString()}`);
  console.log(`Bag size:     ${TOTAL_BALLS} (${config.redBalls} red, ${config.blueBalls} blue)`);
  console.log(`Mode:         ${modeLabel}`);
  console.log(`Workers:      ${NUM_WORKERS}`);

  // The story - setup and results
  console.log('\n--- 📖 L\'Histoire ---');
  console.log(
    `Imagine un sac contenant ${TOTAL_BALLS} boules: ${config.redBalls} 🔴 rouges et ` +
    `${config.blueBalls} 🔵 bleue(s). ${stats.count.toLocaleString()} joueurs vont tenter leur chance.`
  );

  if (config.withReplacement) {
    console.log(
      `Chacun pioche une boule au hasard, la remet dans le sac, et recommence ` +
      `jusqu'à tomber sur la boule bleue.`
    );
    console.log(`La probabilité de succès à chaque tirage est de 1/${TOTAL_BALLS}.\n`);
  } else {
    console.log(
      `Chacun pioche une boule au hasard et la garde. Il recommence ` +
      `jusqu'à tomber sur la boule bleue.`
    );
    console.log(
      `La probabilité augmente à chaque tirage! Au pire, il reste ${config.blueBalls} boule(s) ` +
      `après ${config.redBalls} tirages.\n`
    );
  }

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
  if (config.withReplacement) {
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
  } else {
    console.log(
      `✅ Sans remise, la victoire est GARANTIE en ${TOTAL_BALLS} tentatives maximum.`
    );
    console.log(
      `📈 La probabilité augmente à chaque échec: de 1/${TOTAL_BALLS} au début à 100% à la fin.`
    );
    console.log(
      `⚖️  Écart chanceux/malchanceux: ${stats.max - 1}x (mais max ${TOTAL_BALLS} tentatives).`
    );
    console.log(
      `\n🎯 Sans remise, même le plus malchanceux a une limite. Le système est plus "juste".`
    );
  }

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
  const modeLabel = config.withReplacement ? 'avec remise' : 'sans remise';
  console.log('Starting simulation...');
  console.log(`Config: ${config.players.toLocaleString()} players, ${TOTAL_BALLS} balls (${modeLabel})`);
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
        redBalls: config.redBalls,
        withReplacement: config.withReplacement,
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
