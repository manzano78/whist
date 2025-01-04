import type { GameRepository } from '~/domain/respositories/game-repository';
import type { RoundResultRepository } from '~/domain/respositories/round-result-repository';
import { type Game, getNextRoundInfo } from '~/domain/entities/game';
import { createOutOfSyncRoundSubmissionError } from '~/domain/entities/errors/out-of-sync-round-submission';
import type { RoundResult } from '~/domain/entities/round-result';
import type { RoundDraftRepository } from '~/domain/respositories/round-draft-repository';

export class SaveRoundResultsUseCase {
  constructor(
    private readonly roundResultRepository: RoundResultRepository,
    private readonly roundDraftRepository: RoundDraftRepository,
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

    await Promise.all([
      this.roundResultRepository.createRoundResult(roundResult, roundIndex, game.id),
      this.roundDraftRepository.deleteRoundDraft(game.id),
    ]);

    delete game.draft;
    game.roundResults.push(roundResult);
  }
}
