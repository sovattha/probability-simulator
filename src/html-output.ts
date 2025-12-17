import { writeFileSync } from 'node:fs';
import type { Config, Statistics } from './types.js';

export function generateHtmlReport(
  config: Config,
  stats: Statistics,
  distribution: Map<number, number>,
  totalBalls: number
): string {
  const modeLabel = config.withReplacement ? 'avec remise' : 'sans remise';

  // Prepare data for charts
  const labels = [...distribution.keys()];
  const values = [...distribution.values()];

  // Cumulative distribution
  let cumulative = 0;
  const cumulativeData = values.map(v => {
    cumulative += v;
    return (cumulative / stats.count * 100).toFixed(2);
  });

  // Percentiles
  cumulative = 0;
  let p50 = 0, p90 = 0, p99 = 0;
  for (const [attempts, count] of distribution.entries()) {
    cumulative += count;
    if (!p50 && cumulative >= stats.count * 0.5) p50 = attempts;
    if (!p90 && cumulative >= stats.count * 0.9) p90 = attempts;
    if (!p99 && cumulative >= stats.count * 0.99) p99 = attempts;
  }

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🎲 Simulation de Probabilités</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      color: #eee;
      min-height: 100vh;
      padding: 2rem;
    }
    .container { max-width: 1400px; margin: 0 auto; }
    h1 { text-align: center; font-size: 2.5rem; margin-bottom: 0.5rem; }
    .subtitle { text-align: center; color: #888; margin-bottom: 2rem; }

    .story-box {
      background: linear-gradient(135deg, #0f3460 0%, #16213e 100%);
      border-radius: 16px;
      padding: 2rem;
      margin-bottom: 2rem;
      border: 1px solid #0f3460;
    }
    .story-box h2 { color: #e94560; margin-bottom: 1rem; }
    .story-box p { line-height: 1.8; margin-bottom: 0.5rem; }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .stat-card {
      background: rgba(255,255,255,0.05);
      border-radius: 12px;
      padding: 1.5rem;
      text-align: center;
      border: 1px solid rgba(255,255,255,0.1);
    }
    .stat-card .value { font-size: 2rem; font-weight: bold; color: #e94560; }
    .stat-card .label { color: #888; font-size: 0.9rem; margin-top: 0.5rem; }

    .chart-container {
      background: rgba(255,255,255,0.05);
      border-radius: 16px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      border: 1px solid rgba(255,255,255,0.1);
    }
    .chart-container h3 { margin-bottom: 1rem; color: #e94560; }

    .moral-box {
      background: linear-gradient(135deg, #e94560 0%, #0f3460 100%);
      border-radius: 16px;
      padding: 2rem;
      text-align: center;
    }
    .moral-box h2 { margin-bottom: 1rem; }
    .moral-box .quote {
      font-size: 1.5rem;
      font-style: italic;
      opacity: 0.95;
    }

    .highlight { color: #e94560; font-weight: bold; }
    .lucky { color: #4ade80; }
    .unlucky { color: #f97316; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎲 Simulation de Probabilités</h1>
    <p class="subtitle">${stats.count.toLocaleString()} joueurs · ${totalBalls} boules · ${modeLabel}</p>

    <div class="story-box">
      <h2>📖 L'Histoire</h2>
      <p>Imagine un sac contenant <span class="highlight">${totalBalls} boules</span>:
         ${config.redBalls} 🔴 rouges et ${config.blueBalls} 🔵 bleue(s).</p>
      <p><span class="highlight">${stats.count.toLocaleString()}</span> joueurs vont tenter leur chance.</p>
      ${config.withReplacement
        ? `<p>Chacun pioche une boule au hasard, <strong>la remet dans le sac</strong>, et recommence jusqu'à tomber sur la boule bleue.</p>
           <p>La probabilité de succès à chaque tirage est de <span class="highlight">1/${totalBalls}</span>.</p>`
        : `<p>Chacun pioche une boule au hasard et <strong>la garde</strong>. Il recommence jusqu'à tomber sur la boule bleue.</p>
           <p>La probabilité <span class="highlight">augmente</span> à chaque tirage!</p>`
      }
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="value lucky">🍀 ${distribution.get(1)?.toLocaleString() ?? 0}</div>
        <div class="label">Chanceux (1er coup)</div>
      </div>
      <div class="stat-card">
        <div class="value unlucky">😅 ${stats.max.toLocaleString()}</div>
        <div class="label">Max tentatives</div>
      </div>
      <div class="stat-card">
        <div class="value">${stats.average.toFixed(1)}</div>
        <div class="label">Moyenne</div>
      </div>
      <div class="stat-card">
        <div class="value">${stats.median}</div>
        <div class="label">Médiane</div>
      </div>
      <div class="stat-card">
        <div class="value">${p50}</div>
        <div class="label">50% réussissent en</div>
      </div>
      <div class="stat-card">
        <div class="value">${p90}</div>
        <div class="label">90% réussissent en</div>
      </div>
    </div>

    <div class="chart-container">
      <h3>📊 Distribution des tentatives</h3>
      <canvas id="distributionChart" height="100"></canvas>
    </div>

    <div class="chart-container">
      <h3>📈 Distribution cumulative (% de joueurs ayant réussi)</h3>
      <canvas id="cumulativeChart" height="100"></canvas>
    </div>

    <div class="moral-box">
      <h2>💡 Ce que ça nous apprend</h2>
      ${config.withReplacement
        ? `<p class="quote">🎯 La chance détermine le "quand", pas le "si".<br>Celui qui persévère gagne toujours.</p>`
        : `<p class="quote">🎯 Sans remise, même le plus malchanceux a une limite.<br>Le système est plus "juste".</p>`
      }
    </div>
  </div>

  <script>
    const labels = ${JSON.stringify(labels.slice(0, 100))};
    const values = ${JSON.stringify(values.slice(0, 100))};
    const cumulativeData = ${JSON.stringify(cumulativeData.slice(0, 100))};

    // Distribution Chart
    new Chart(document.getElementById('distributionChart'), {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Nombre de joueurs',
          data: values,
          backgroundColor: 'rgba(233, 69, 96, 0.7)',
          borderColor: 'rgba(233, 69, 96, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            title: { display: true, text: 'Nombre de tentatives', color: '#888' },
            ticks: { color: '#888' },
            grid: { color: 'rgba(255,255,255,0.1)' }
          },
          y: {
            title: { display: true, text: 'Nombre de joueurs', color: '#888' },
            ticks: { color: '#888' },
            grid: { color: 'rgba(255,255,255,0.1)' }
          }
        }
      }
    });

    // Cumulative Chart
    new Chart(document.getElementById('cumulativeChart'), {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: '% cumulé',
          data: cumulativeData,
          borderColor: 'rgba(74, 222, 128, 1)',
          backgroundColor: 'rgba(74, 222, 128, 0.1)',
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            title: { display: true, text: 'Nombre de tentatives', color: '#888' },
            ticks: { color: '#888' },
            grid: { color: 'rgba(255,255,255,0.1)' }
          },
          y: {
            title: { display: true, text: '% de joueurs ayant réussi', color: '#888' },
            ticks: { color: '#888' },
            grid: { color: 'rgba(255,255,255,0.1)' },
            min: 0,
            max: 100
          }
        }
      }
    });
  </script>
</body>
</html>`;

  const filename = 'simulation-results.html';
  writeFileSync(filename, html);
  return filename;
}
