export type Ranking = Array<{
  player: string;
  index: number;
  isExAequoWithPrevious: boolean;
  cumulativePoints: number;
}>;
