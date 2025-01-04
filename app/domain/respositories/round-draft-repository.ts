import type { Game } from '~/domain/entities/game';
import type { RoundDraft } from '~/domain/entities/draft';

export interface RoundDraftRepository {
  deleteRoundDraft(gameId: Game['id']): Promise<void>;
  createRoundDraft(roundDraft: RoundDraft, gameId: Game['id']): Promise<void>;
}
