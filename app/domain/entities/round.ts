import type { RoundDirection } from '~/domain/entities/round-direction';

export interface Round {
  index: number;
  totalRounds: number;
  totalCardsPerPlayer: number;
  direction: RoundDirection;
  dealer: string;
  playersInRoundOrder: string[];
}
