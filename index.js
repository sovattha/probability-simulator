const Parallel = require("paralleljs");

// Configuration - can be overridden via CLI arguments
const CONFIG = {
    players: 1e6,
    redBalls: 499,
    blueBalls: 1
};

// Parse CLI arguments (e.g., node index.js --players=1000000 --redBalls=99)
process.argv.slice(2).forEach(arg => {
    const [key, value] = arg.replace('--', '').split('=');
    if (key in CONFIG && !isNaN(Number(value))) {
        CONFIG[key] = Number(value);
    }
});

const TOTAL_BALLS = CONFIG.redBalls + CONFIG.blueBalls;

// Build the simulation function as a string with embedded config values
// This is necessary because paralleljs serializes functions and runs them in separate processes
function buildSimulationFunction(redBalls, blueBalls, totalBalls) {
    return new Function('playerIndex', `
        const TOTAL_BALLS = ${totalBalls};
        const BLUE_BALLS = ${blueBalls};

        let attempts = 0;
        while (true) {
            attempts++;
            // Random index from 0 to totalBalls-1
            const index = Math.floor(Math.random() * TOTAL_BALLS);
            // Blue balls are at indices 0 to blueBalls-1
            if (index < BLUE_BALLS) {
                return attempts;
            }
        }
    `);
}

function calculateStatistics(results) {
    const sorted = [...results].sort((a, b) => a - b);
    const sum = results.reduce((acc, val) => acc + val, 0);
    const count = results.length;

    return {
        count,
        min: sorted[0],
        max: sorted[count - 1],
        average: sum / count,
        median: count % 2 === 0
            ? (sorted[count / 2 - 1] + sorted[count / 2]) / 2
            : sorted[Math.floor(count / 2)],
        theoretical: TOTAL_BALLS / CONFIG.blueBalls
    };
}

function buildDistribution(results) {
    const distribution = new Map();
    results.forEach(attempts => {
        distribution.set(attempts, (distribution.get(attempts) || 0) + 1);
    });
    return new Map([...distribution].sort((a, b) => a[0] - b[0]));
}

function formatOutput(stats, distribution) {
    console.log('\n=== SIMULATION RESULTS ===\n');
    console.log(`Players:      ${stats.count.toLocaleString()}`);
    console.log(`Bag size:     ${TOTAL_BALLS} (${CONFIG.redBalls} red, ${CONFIG.blueBalls} blue)`);
    console.log(`Probability:  1/${TOTAL_BALLS}`);

    console.log('\n--- Statistics ---');
    console.log(`Theoretical:  ${stats.theoretical.toFixed(2)} attempts`);
    console.log(`Average:      ${stats.average.toFixed(2)} attempts`);
    console.log(`Median:       ${stats.median.toFixed(2)} attempts`);
    console.log(`Min:          ${stats.min} attempts`);
    console.log(`Max:          ${stats.max} attempts`);

    console.log('\n--- Distribution (top 20) ---');
    console.log('Attempts → Players (%)');

    const entries = [...distribution.entries()].slice(0, 20);
    entries.forEach(([attempts, count]) => {
        const percentage = ((count / stats.count) * 100).toFixed(2);
        const bar = '█'.repeat(Math.min(50, Math.round(percentage * 2)));
        console.log(`${String(attempts).padStart(4)} → ${String(count).padStart(8)} (${percentage.padStart(5)}%) ${bar}`);
    });

    if (distribution.size > 20) {
        console.log(`... and ${distribution.size - 20} more`);
    }
}

// Main execution
console.log('Starting simulation...');
console.log(`Config: ${CONFIG.players.toLocaleString()} players, ${TOTAL_BALLS} balls in bag`);
console.time('Simulation time');

const playerIndices = Array.from({ length: CONFIG.players }, (_, i) => i);
const p = new Parallel(playerIndices);

const simulationFn = buildSimulationFunction(CONFIG.redBalls, CONFIG.blueBalls, TOTAL_BALLS);

p.map(simulationFn).then(results => {
    console.timeEnd('Simulation time');

    const stats = calculateStatistics(results);
    const distribution = buildDistribution(results);

    formatOutput(stats, distribution);
});
