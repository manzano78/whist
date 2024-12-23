import type { Game } from '~/domain/entities/game';
import type { AppUser } from '~/domain/entities/app-user';

export interface GameRepository {
  getCurrentGame(appUser: AppUser): Promise<Game | null>;
  getLastTerminatedGame(appUser: AppUser): Promise<Game | null>;
  saveGame(game: Game): Promise<void>;
  deleteGame(game: Game): Promise<void>;
}
