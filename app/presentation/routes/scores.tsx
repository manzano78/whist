import type { Route } from './+types/scores';
import { Scores } from '~/presentation/features/display-scores';
import { getApp } from '~/presentation/infrastructure/app';
import type { Info } from './+types/scores';
import { getRoundInfoList, getRoundScores, isTerminated } from '~/domain/entities/game';

export const handle: RouteHandle<Info['loaderData'], Info['params']> = {
  navigationConfig: {
    title: 'Scores',
    backUrl: ({ loaderData, params }) => !loaderData.isTerminated && `/games/${params.gameId}/play`,
    hasNewGameLink: true,
  },
};

export async function loader({ request, context, params }: Route.LoaderArgs) {
  const { getCurrentAppUser, gameRepository } = getApp(context);
  const currentAppUser = await getCurrentAppUser(request);
  const game = await gameRepository.getGame(currentAppUser.id, params.gameId);

  return {
    roundInfos: getRoundInfoList(game).slice(0, game.roundResults.length),
    roundResults: game.roundResults,
    playersInOrder: game.playersInOrder,
    roundScores: getRoundScores(game),
    isTerminated: isTerminated(game),
  };
}

export default function ScoresRoute({ loaderData }: Route.ComponentProps) {
  const {
    roundScores,
    roundInfos,
    isTerminated,
    roundResults,
    playersInOrder,
  } = loaderData;

  return (
    <Scores
      roundScores={roundScores}
      isTerminated={isTerminated}
      roundInfos={roundInfos}
      roundResults={roundResults}
      playersInOrder={playersInOrder}
    />
  );
}