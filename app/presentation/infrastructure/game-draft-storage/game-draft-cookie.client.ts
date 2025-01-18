import type { RoundDraft } from '~/domain/entities/draft';
import Cookie from 'js-cookie';
import { getGameDraftCookieName } from '~/presentation/infrastructure/game-draft-storage/game-draft-cookie';

export function saveGameDraftToCookie(gameId: string, roundDraft: RoundDraft): void {
  const cookieName = getGameDraftCookieName(gameId);

  Cookie.set(cookieName, JSON.stringify(roundDraft), {
    path: '/',
    secure: true,
    sameSite: 'lax',
    expires: 7,
  });
}
