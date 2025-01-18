export interface GameListItem {
  id: string;
  isTerminated: boolean;
  creationDate: Date;
  playersInOrder: string[];
  totalPassedRounds: number;
}