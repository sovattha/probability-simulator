const Parallel = require("paralleljs");

const PLAYERS = 1e7;
(() => {

    function getBlueBall(playerIndex) {

        class Ball {
            color; // red or blue
            constructor(color) {
                this.color = color;
            }
        }
        
        class Bag {
            balls = [];
            constructor() {
                for (var i = 0; i < 500-1; i++) {
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
                return this.bag.balls[this.randomIntFromInterval(1, this.bag.balls.length-1)];
            }
            randomIntFromInterval(min, max) { // min and max included 
                return Math.floor(Math.random() * (max - min + 1) + min)
            }
        }

        const player = new Player(`player${playerIndex}`);
        let attempt = 0;
        let ballColor = '';
        while(ballColor !== 'blue') {
            ballColor = player.pickBall().color;
            attempt++;
        }
        return (attempt);
    }

    console.time('Simulation');
    console.log('BAG SIZE', 500);
    console.log('PLAYERS', PLAYERS);
    console.log('number of attempts => players count');
    const p = new Parallel(Array.from(Array(PLAYERS).keys()));
    p.map(getBlueBall).then(attempt => {
        const resultsMap = new Map();
        attempt.forEach(a => resultsMap.set(a, (resultsMap.get(a) || 0) + 1));
        const sortNumAsc = new Map([...resultsMap].sort((a, b) => a[0] - b[0]));
        console.log(sortNumAsc);
        console.timeEnd('Simulation');
    });
    
})();

