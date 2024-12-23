export type RoundDirection = 'asc' | 'no-trump-1' | 'no-trump-2' | 'desc';

export interface RoundInfo {
  index: number;
  totalCardsPerPlayer: number;
  direction: RoundDirection;
  dealer: string;
  playersInRoundOrder: string[];
}
