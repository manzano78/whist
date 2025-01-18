import type { Game } from '~/domain/entities/game';
import type { GameListItem } from '~/domain/entities/game-list-item';

export interface GameRepository {
  getGame(ownerId: number, id: Game['id']): Promise<Game>;
  getGames(ownerId: number, page: number, size: number, isTerminated?: boolean): Promise<{
    list: GameListItem[];
    totalElements: number;
  }>;
  getLastTerminatedGame(ownerId: number): Promise<Game | null>;
  terminateGame(gameId: Game['id']): Promise<void>;
  deleteGames(ownerId: number, gameIds: Game['id'][]): Promise<void>;
  createGame(ownerId: number, playersInOrder: string[]): Promise<Game>;
}
