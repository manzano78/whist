import type { RoundResult } from '~/domain/entities/round-result';

export interface RoundResultRepository {
  createRoundResult(roundResult: RoundResult, index: number, gameId: string): Promise<void>;
}