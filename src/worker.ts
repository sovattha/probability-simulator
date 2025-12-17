import { parentPort, workerData } from 'node:worker_threads';
import type { WorkerData } from './types.js';

const { count, totalBalls, blueBalls, redBalls, withReplacement } = workerData as WorkerData;

function simulateWithReplacement(): number {
  let attempts = 0;
  while (true) {
    attempts++;
    const index = Math.floor(Math.random() * totalBalls);
    if (index < blueBalls) {
      return attempts;
    }
  }
}

function simulateWithoutReplacement(): number {
  let remainingRed = redBalls;
  let remainingBlue = blueBalls;
  let attempts = 0;

  while (remainingBlue > 0) {
    attempts++;
    const total = remainingRed + remainingBlue;
    const index = Math.floor(Math.random() * total);

    if (index < remainingBlue) {
      // Found blue ball!
      return attempts;
    } else {
      // Red ball - remove it from the bag
      remainingRed--;
    }
  }

  return attempts; // Should never reach here
}

const results: number[] = [];
for (let i = 0; i < count; i++) {
  results.push(withReplacement ? simulateWithReplacement() : simulateWithoutReplacement());
}

parentPort?.postMessage(results);
