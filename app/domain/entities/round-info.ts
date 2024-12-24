import type { RoundDirection } from '~/domain/entities/round-direction';

export interface RoundInfo {
  index: number;
  totalCardsPerPlayer: number;
  direction: RoundDirection;
  dealer: string;
  playersInRoundOrder: string[];
}
