import type { RoundDraft } from '~/domain/entities/draft';
import Cookie from 'cookie';
import { type Game, getNextRoundInfo } from '~/domain/entities/game';
import { getGameDraftCookieName } from '~/presentation/infrastructure/game-draft-storage/game-draft-cookie';

export function parseGameDraftFromCookie(game: Game, cookieHeader: string | null): RoundDraft | null {
  if (!cookieHeader) {
    return null;
  }

  const cookieName = getGameDraftCookieName(game.id);
  const { [cookieName]: rawDraft } = Cookie.parse(cookieHeader);

  if (!rawDraft) {
    return null;
  }

  const draftObj = JSON.parse(rawDraft ) as RoundDraft; // todo: validate with zod instead (never trust browser)
  const roundInfo = getNextRoundInfo(game);

  return draftObj && draftObj.roundIndex === roundInfo.index ? draftObj : null;
}

export function deleteGameDraftFromCookie(gameId: string): string {
  const cookieName = getGameDraftCookieName(gameId);

  return Cookie.serialize(cookieName, '', { expires: new Date(0) });
}
