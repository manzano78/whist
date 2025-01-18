import { redirect } from 'react-router';
import type { Info, Route } from './+types/play-round';
import type { RoundResult } from '~/domain/entities/round-result';
import { PlayRoundForm } from '~/presentation/features/play-round';
import { getApp } from '~/presentation/infrastructure/app';
import { RoundTitle } from '~/presentation/features/play-round/components/round-title';
import { getGameGlobalProperties, getNextRoundInfo, getRanking, isTerminated } from '~/domain/entities/game';
import {
  deleteGameDraftFromCookie,
  parseGameDraftFromCookie
} from '~/presentation/infrastructure/game-draft-storage/game-draft-cookie.server';

export const handle: RouteHandle<Info['loaderData']> = {
  navigationConfig: {
    title: ({ totalRounds, roundInfo }) => (
      <RoundTitle
        totalRounds={totalRounds}
        roundIndex={roundInfo.index}
        direction={roundInfo.direction}
      />
    ),
    hasNewGameLink: true,
  },
};

export async function loader({ request, context, params }: Route.LoaderArgs) {
  const { gameRepository, getCurrentAppUser } = getApp(context);
  const currentAppUser = await getCurrentAppUser(request);
  const game = await gameRepository.getGame(currentAppUser.id, params.gameId);

  if (isTerminated(game)) {
    throw redirect(`/games/${game.id}/scores`);
  }

  const roundInfo = getNextRoundInfo(game);
  const ranking = getRanking(game);
  const { totalRounds } = getGameGlobalProperties(game.playersInOrder.length);
  const draft = parseGameDraftFromCookie(game, request.headers.get('Cookie')) ?? undefined;

  return {
    roundInfo,
    ranking,
    totalRounds,
    draft,
  };
}

export async function action({ request, params, context }: Route.ActionArgs) {
  const { getCurrentAppUser, gameRepository, saveRoundResultsUseCase } = getApp(context);
  const currentAppUser = await getCurrentAppUser(request);
  const game = await gameRepository.getGame(currentAppUser.id, params.gameId);
  const formData = await request.formData();
  const roundIndex = Number(formData.get('roundIndex'));
  const players = formData.getAll('player') as string[];
  const calls = (formData.getAll('call') as string[]).map(Number);
  const results = (formData.getAll('result') as string[]).map(Number);
  const roundResult = players.reduce((acc, player, i) => {
    acc[player] = {
      call: calls[i],
      result: results[i],
    };

    return acc;
  }, {} as RoundResult);

  await saveRoundResultsUseCase.saveRoundResults(roundIndex, roundResult, game);

  const redirectionUrl = isTerminated(game) ? `/games/${game.id}/scores` : `/games/${game.id}/play`;

  return redirect(redirectionUrl, {
    headers: {
      'Set-Cookie': deleteGameDraftFromCookie(game.id),
    }
  });
}

export default function PlayGameRoute({ loaderData, params }: Route.ComponentProps) {
  const { roundInfo, ranking, draft } = loaderData;
  const roundFormKey = `${params.gameId}-${roundInfo.index}`;

  return (
    <PlayRoundForm
      key={roundFormKey}
      defaultGameId={params.gameId}
      defaultRoundInfo={roundInfo}
      defaultRanking={ranking}
      defaultDraft={draft}
    />
  );
}
