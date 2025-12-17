# 🎲 Probability Simulator / Simulateur de Probabilités

[English](#english) | [Français](#français)

---

## English

### What is this?

An interactive web application that simulates probability scenarios to help understand statistics through storytelling. Perfect for learning about probability distributions, expected values, and the mathematics behind games of chance.

**No installation required** - just open `app.html` in your browser!

### Features

- **7 simulation modes** with unique probability mechanics
- **Bilingual interface** (French/English)
- **Interactive charts** showing distribution and cumulative probability
- **"Explained to an 8-year-old"** section for intuitive understanding
- **100,000 simulations** run instantly in your browser

### Simulation Modes

| Mode | Description | What it teaches |
|------|-------------|-----------------|
| 🔄 **With Replacement** | Ball goes back in the bag | Geometric distribution, perseverance always wins |
| 🎯 **Without Replacement** | Ball is kept | Uniform distribution, guaranteed maximum attempts |
| 🎰 **Pity System** | Guaranteed win after X failures | How gacha games manipulate players |
| 🏆 **Competition** | Multiple players, first to win | Structural advantage of turn order |
| 🔥 **Streaks** | Probability changes with consecutive results | The gambler's fallacy |
| 💰 **Economy** | Cost per try vs reward | Expected value and profitability |
| 🎯 **Multi-target** | Find N blue balls | How variance scales with goals |

### How to Use

1. Open `app.html` in any modern browser
2. Select a game mode from the sidebar
3. Adjust configuration (number of players, balls, etc.)
4. Click "Run simulation"
5. Explore the results: story, charts, statistics, and insights

### The Story

> Imagine a bag containing 500 balls: 499 red and 1 blue.
> 100,000 players will try their luck.
> Each picks a ball at random and puts it back. They repeat until they find the blue one.
>
> 🍀 Some lucky ones find it on the first try!
> 😅 The unluckiest needed thousands of attempts...
>
> **But guess what? EVERYONE eventually finds the blue ball.**
> Luck determines "when", not "if". Those who persevere always win.

### Technical Details

- Pure HTML/CSS/JavaScript - no build step required
- Uses [Chart.js](https://www.chartjs.org/) for visualizations
- Simulations run client-side using optimized loops
- Also includes a Node.js CLI version with multi-threading (`npm start`)

---

## Français

### C'est quoi ?

Une application web interactive qui simule des scénarios de probabilités pour comprendre les statistiques à travers des histoires. Parfait pour apprendre les distributions de probabilité, l'espérance mathématique, et les mathématiques derrière les jeux de hasard.

**Aucune installation requise** - ouvre simplement `app.html` dans ton navigateur !

### Fonctionnalités

- **7 modes de simulation** avec des mécaniques de probabilité uniques
- **Interface bilingue** (Français/Anglais)
- **Graphiques interactifs** montrant distribution et probabilité cumulative
- **Section "Expliqué à un enfant de 8 ans"** pour une compréhension intuitive
- **100 000 simulations** exécutées instantanément dans ton navigateur

### Modes de Simulation

| Mode | Description | Ce que ça enseigne |
|------|-------------|-------------------|
| 🔄 **Avec remise** | La boule retourne dans le sac | Distribution géométrique, la persévérance gagne toujours |
| 🎯 **Sans remise** | La boule est gardée | Distribution uniforme, maximum d'essais garanti |
| 🎰 **Pity System** | Victoire garantie après X échecs | Comment les jeux gacha manipulent les joueurs |
| 🏆 **Compétition** | Plusieurs joueurs, premier à gagner | Avantage structurel de l'ordre de passage |
| 🔥 **Streaks** | La probabilité change avec les résultats consécutifs | L'erreur du joueur |
| 💰 **Économie** | Coût par essai vs récompense | Espérance et rentabilité |
| 🎯 **Multi-cibles** | Trouver N boules bleues | Comment la variance augmente avec les objectifs |

### Comment l'utiliser

1. Ouvre `app.html` dans n'importe quel navigateur moderne
2. Sélectionne un mode de jeu dans la barre latérale
3. Ajuste la configuration (nombre de joueurs, boules, etc.)
4. Clique sur "Lancer la simulation"
5. Explore les résultats : histoire, graphiques, statistiques et enseignements

### L'Histoire

> Imagine un sac contenant 500 boules : 499 rouges et 1 bleue.
> 100 000 joueurs vont tenter leur chance.
> Chacun pioche une boule au hasard et la remet dans le sac. Il recommence jusqu'à trouver la bleue.
>
> 🍀 Certains chanceux la trouvent du premier coup !
> 😅 Le plus malchanceux a eu besoin de milliers de tentatives...
>
> **Mais tu sais quoi ? TOUT LE MONDE finit par trouver la boule bleue.**
> La chance détermine le "quand", pas le "si". Celui qui persévère gagne toujours.

### Détails Techniques

- HTML/CSS/JavaScript pur - aucune étape de build requise
- Utilise [Chart.js](https://www.chartjs.org/) pour les visualisations
- Simulations exécutées côté client avec des boucles optimisées
- Inclut aussi une version CLI Node.js avec multi-threading (`npm start`)

---

## CLI Version (Node.js)

For more advanced simulations with millions of players:

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run simulation
npm start

# With custom parameters
npm start -- --players=1000000 --redBalls=99 --blueBalls=1 --withReplacement=false --output=html
```

### CLI Arguments

| Argument | Default | Description |
|----------|---------|-------------|
| `--players` | 1,000,000 | Number of simulations |
| `--redBalls` | 499 | Red balls in bag |
| `--blueBalls` | 1 | Blue balls in bag |
| `--withReplacement` | true | Put ball back after each draw |
| `--output` | console | Output format: `console` or `html` |

---

## License

MIT License - Feel free to use, modify, and share!

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.
