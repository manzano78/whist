import { type Game, getNextRoundInfo } from '~/domain/entities/game';
import { createOutOfSyncRoundSubmissionError } from '~/domain/entities/errors/out-of-sync-round-submission';
import type { RoundDraftRepository } from '~/domain/respositories/round-draft-repository';
import type { RoundDraft } from '~/domain/entities/draft';

export class SaveRoundDraftUseCase {
  constructor(
    private readonly roundDraftRepository: RoundDraftRepository,
  ) {}

  async saveRoundDraft(
    roundIndex: number,
    roundDraft: RoundDraft,
    game: Game,
  ): Promise<void> {
    const nextRoundInfo = getNextRoundInfo(game);

    if (roundIndex !== nextRoundInfo.index) {
      throw createOutOfSyncRoundSubmissionError(nextRoundInfo.index, roundIndex);
    }

    await this.roundDraftRepository.createRoundDraft(roundDraft, game.id);

    game.draft = roundDraft;
  }
}
