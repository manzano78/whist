export interface Round {
  index: number;
  totalRounds: number;
  totalCardsPerPlayer: number;
  direction: 'asc' | 'no-trump-1' | 'no-trump-2' | 'desc';
  dealer: string;
  playersInRoundOrder: string[];
}
