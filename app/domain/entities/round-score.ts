import { Ranking } from '~/domain/entities/ranking';

export interface RoundScore {
  cumulativeRanking: Ranking;
  results: {
    [player: string]: {
      points: number;
      cumulativePoints: number;
      cumulativeWonRounds: number;
      cumulativeLostRounds: number;
      cumulativeCalls: number;
      cumulativeWonCalls: number;
    }
  }
}
