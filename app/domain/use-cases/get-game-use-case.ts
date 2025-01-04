import type { GameRepository } from '~/domain/respositories/game-repository';
import type { AppUser } from '~/domain/entities/app-user';
import { createUnauthorizedGameError } from '~/domain/entities/errors/unauthorized-game-error';
import { type Game, isTerminated } from '~/domain/entities/game';

export class GetGameUseCase {
  constructor(
    private readonly gameRepository: GameRepository,
  ) {}

  async getGame(id: Game['id'], owner: AppUser): Promise<Game> {
    const game = await this.gameRepository.getGame(id);

    if (game.ownerId !== owner.id) {
      throw createUnauthorizedGameError();
    }

    return game;
  }
}
