export interface Config {
  players: number;
  redBalls: number;
  blueBalls: number;
}

export interface WorkerData {
  startIndex: number;
  count: number;
  totalBalls: number;
  blueBalls: number;
}

export interface Statistics {
  count: number;
  min: number;
  max: number;
  average: number;
  median: number;
  theoretical: number;
}
