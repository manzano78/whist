import { AppUserRepository } from '~/domain/respositories/app-user-repository';
import { AppUser } from '~/domain/entities/app-user';
import { addPlayersToAppUser } from '~/domain/services/app-user-service';
import { GameRepository } from '~/domain/respositories/game-repository';
import { Game } from '~/domain/entities/game';

export class CreateNewGameUseCase {
  constructor(
    private appUserRepository: AppUserRepository,
    private gameRepository: GameRepository,
  ) {}

  async createNewGame(owner: AppUser, playersInOrder: string[]): Promise<Game> {
    const game = Game.createNew(owner, playersInOrder);
    const didAddNewPlayersToAppUser = addPlayersToAppUser(playersInOrder, owner);

    await Promise.all([
      this.gameRepository.saveGame(game),
      didAddNewPlayersToAppUser && this.appUserRepository.saveAppUser(owner)
    ]);

    return game;
  }
}
