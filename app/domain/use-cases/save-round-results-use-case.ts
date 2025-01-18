import type { GameRepository } from '~/domain/respositories/game-repository';
import type { RoundResultRepository } from '~/domain/respositories/round-result-repository';
import { type Game, getNextRoundInfo, isTerminated } from '~/domain/entities/game';
import { createOutOfSyncRoundSubmissionError } from '~/domain/entities/errors/out-of-sync-round-submission';
import type { RoundResult } from '~/domain/entities/round-result';

export class SaveRoundResultsUseCase {
  constructor(
    private readonly roundResultRepository: RoundResultRepository,
    private readonly gameRepository: GameRepository,
  ) {}

  async saveRoundResults(
    roundIndex: number,
    roundResult: RoundResult,
    game: Game,
  ): Promise<void> {
    const nextRoundInfo = getNextRoundInfo(game);

    if (roundIndex !== nextRoundInfo.index) {
      throw createOutOfSyncRoundSubmissionError(nextRoundInfo.index, roundIndex);
    }

    game.roundResults.push(roundResult);

    await Promise.all([
      this.roundResultRepository.createRoundResult(roundResult, roundIndex, game.id),
      isTerminated(game) && this.gameRepository.terminateGame(game.id),
    ]);
  }
}
