import { RoundResult } from '~/domain/entities/round-result';
import { Game } from '~/domain/entities/game';
import { GameRepository } from '~/domain/respositories/game-repository';

export class SaveRoundResultUseCase {
  constructor(
    private gameRepository: GameRepository
  ) {}

  async saveRoundResult(roundResult: RoundResult, game: Game): Promise<void> {
    game.pushRoundResult(roundResult);

    await this.gameRepository.saveGame(game);
  }
}