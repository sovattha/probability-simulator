import { parentPort, workerData } from 'node:worker_threads';
import type { WorkerData } from './types.js';

const { count, totalBalls, blueBalls } = workerData as WorkerData;

function simulate(): number {
  let attempts = 0;
  while (true) {
    attempts++;
    const index = Math.floor(Math.random() * totalBalls);
    if (index < blueBalls) {
      return attempts;
    }
  }
}

const results: number[] = [];
for (let i = 0; i < count; i++) {
  results.push(simulate());
}

parentPort?.postMessage(results);
