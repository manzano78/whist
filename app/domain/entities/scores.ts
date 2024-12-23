export interface Scores {
  players: string[];
  isFinal: boolean;
  rounds: Array<{
    totalCardsPerPlayer: number;
    direction: 'asc' | 'no-trump-1' | 'no-trump-2' | 'desc';
    cumulativeRanking: Array<{
      player: string;
      index: number;
      isExAequoWithPrevious: boolean;
      cumulativePoints: number;
    }>;
    dealer: string;
    results: {
      [player: string]: {
        call: number;
        delta: number;
        points: number;
        cumulativePoints: number;
        cumulativeWonRounds: number;
        cumulativeLostRounds: number;
        cumulativeCalls: number;
      }
    }
  }>
}
