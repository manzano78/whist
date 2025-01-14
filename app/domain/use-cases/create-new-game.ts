import type { AppUserRepository } from '~/domain/respositories/app-user-repository';
import type { AppUser } from '~/domain/entities/app-user';
import type { GameRepository } from '~/domain/respositories/game-repository';
import type { Game } from '~/domain/entities/game';

export class CreateNewGameUseCase {
  constructor(
    private readonly appUserRepository: AppUserRepository,
    private readonly gameRepository: GameRepository,
  ) {}

  async createNewGame(owner: AppUser, playersInOrder: string[]): Promise<Game> {
    const ownerPlayers = new Set(owner.players);
    const newPlayers = playersInOrder.filter((player) => !ownerPlayers.has(player));
    const [game] = await Promise.all([
      this.gameRepository.createGame(owner.id, playersInOrder),
      newPlayers.length !== 0 && this.appUserRepository.createAppUserPlayers(owner.id, newPlayers),
    ]);

    return game;
  }
}
