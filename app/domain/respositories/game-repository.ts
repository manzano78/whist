import { Game } from '~/domain/entities/game';
import { AppUser } from '~/domain/entities/app-user';

export interface GameRepository {
  getCurrentGame(appUser: AppUser): Promise<Game | null>;
  getLastTerminatedGame(appUser: AppUser): Promise<Game | null>;
  saveGame(game: Game): Promise<void>;
  deleteGame(game: Game): Promise<void>;
}
