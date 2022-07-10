const BAG_SIZE = 50;
const PLAYERS = 100;

class Ball {
    color; // red or blue
    constructor(color) {
        this.color = color;
    }
}

class Bag {
    balls = [];
    constructor() {
        for (var i = 0; i < BAG_SIZE-1; i++) {
            this.balls.push(new Ball('red'));
        }
        this.balls.push(new Ball('blue'));
    }
}

class Player {
    constructor(name) {
        this.name = name;
        this.bag = new Bag();
    }
    pickBall() {
        return this.bag.balls[this.randomIntFromInterval(1, BAG_SIZE-1)];
    }
    randomIntFromInterval(min, max) { // min and max included 
        return Math.floor(Math.random() * (max - min + 1) + min)
    }
}

const resultsMap = new Map();
(async () => {
    await Promise.all(Array.from(Array(PLAYERS).keys()).map(playerIndex => getBlueBall(new Player(`player${playerIndex}`)).then(attempt => {
        resultsMap.set(attempt, (resultsMap.get(attempt) || 0) + 1);
    })));
    const sortNumAsc = new Map([...resultsMap].sort((a, b) => a[0] - b[0]));
    console.log('BAG SIZE', BAG_SIZE);
    console.log('PLAYERS', PLAYERS);
    console.log('number of attempts => players count');
    console.log(sortNumAsc);
})().then();


async function getBlueBall(player) {
    let attempt = 0;
    return new Promise(resolve => {
        let ballColor = '';
        while(ballColor !== 'blue') {
            ballColor = player.pickBall().color;
            attempt++;
        }
        resolve(attempt);
    });
}
