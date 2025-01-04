import type { Route } from "./+types/save-game-round-draft";
import { getApp } from '~/presentation/infrastructure/app';
import { getNextRoundInfo } from '~/domain/entities/game';
import type { RoundDraft } from '~/domain/entities/draft';
import { redirect } from 'react-router';

export async function action({ params, request, context }: Route.ActionArgs) {
  const { getCurrentAppUser, saveRoundDraftUseCase, getGameUseCase } = getApp(context);
  const currentAppUser = await getCurrentAppUser(request);
  const game = await getGameUseCase.getGame(params.gameId, currentAppUser);
  const nextRoundInfo = getNextRoundInfo(game);
  const formData = await request.formData();
  const roundIndex = Number(formData.get('roundIndex'));

  const calls = (formData.getAll('call') as string[]).filter((call) => !!call).map(Number);
  const rawCallIndex = formData.get('callIndex') as string | null;

  let roundDraft: RoundDraft;

  if (rawCallIndex !== null) {
    const callIndex = Number(rawCallIndex);
    const isInError = formData.has('isCallInError');
    const isFixing = formData.has('isFixingCall');

    roundDraft = {
      calls,
      callIndex,
      isFixing,
      isInError,
      roundIndex,
    };
  } else {
    const results = (formData.getAll('result') as string[]).filter((result) => !!result).map(Number);

    roundDraft = {
      calls,
      results,
      roundIndex,
    };
  }

  await saveRoundDraftUseCase.saveRoundDraft(roundIndex, roundDraft, game);

  return redirect(formData.get('redirectionUrl') as string);
}
