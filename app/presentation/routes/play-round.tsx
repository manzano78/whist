import { redirect } from 'react-router';
import type { Info, Route } from './+types/play-round';
import type { RoundResult } from '~/domain/entities/round-result';
import { PlayRoundForm } from '~/presentation/features/play-round';
import { getApp } from '~/presentation/infrastructure/app';
import { RoundTitle } from '~/presentation/features/play-round/components/round-title';
import { getGameGlobalProperties, getNextRoundInfo, getRanking, isTerminated } from '~/domain/entities/game';
import Cookie from 'cookie';
import type { RoundDraft } from '~/domain/entities/draft';

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
  const { getGameUseCase, getCurrentAppUser } = getApp(context);
  const currentAppUser = await getCurrentAppUser(request);
  const game = await getGameUseCase.getGame(params.gameId, currentAppUser);

  if (isTerminated(game)) {
    throw redirect(`/games/${game.id}/scores`);
  }

  const cookieHeader = request.headers.get('Cookie');
  const { [`draft-${game.id}`]: rawDraft } = cookieHeader ? Cookie.parse(cookieHeader) : {} as Record<string, string>;
  const draftObj = rawDraft ? JSON.parse(rawDraft ) as RoundDraft : undefined;
  const roundInfo = getNextRoundInfo(game);
  const ranking = getRanking(game);
  const { totalRounds } = getGameGlobalProperties(game);
  const draft = draftObj && draftObj.roundIndex === roundInfo.index ? draftObj : undefined;

  return {
    roundInfo,
    ranking,
    totalRounds,
    draft,
  };
}

export async function action({ request, params, context }: Route.ActionArgs) {
  const { getCurrentAppUser, getGameUseCase, saveRoundResultsUseCase } = getApp(context);
  const currentAppUser = await getCurrentAppUser(request);
  const game = await getGameUseCase.getGame(params.gameId, currentAppUser);
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

  if (isTerminated(game)) {
    return redirect(`/games/${game.id}/scores`);
  }

  return redirect(`/games/${game.id}/play`, {
    headers: {
      'Set-Cookie': Cookie.serialize(`draft-${game.id}`, '', { expires: new Date(0) }),
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