import type { Game } from '~/domain/entities/game';

export interface GameRepository {
  getGame(id: Game['id']): Promise<Game>
  getLastTerminatedGame(ownerId: number): Promise<Game | null>;
  terminateGame(gameId: Game['id']): Promise<void>;
  deleteGame(gameId: Game['id']): Promise<void>;
  createGame(ownerId: number, playersInOrder: string[]): Promise<Game>;
}
