export interface Config {
  players: number;
  redBalls: number;
  blueBalls: number;
  withReplacement: boolean;
  output: 'console' | 'html';
}

export interface WorkerData {
  startIndex: number;
  count: number;
  totalBalls: number;
  blueBalls: number;
  redBalls: number;
  withReplacement: boolean;
}

export interface Statistics {
  count: number;
  min: number;
  max: number;
  average: number;
  median: number;
  theoretical: number;
}
