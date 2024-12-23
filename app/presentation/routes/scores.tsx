import { redirect } from 'react-router';
import type { Route } from './+types/scores';
import { Scores } from '~/presentation/features/display-scores';
import { getApp } from '~/presentation/infrastructure/app';

export async function loader({ request, context }: Route.LoaderArgs) {
  const { getCurrentAppUser, gameRepository } = getApp(context)
  const currentAppUser = await getCurrentAppUser(request);
  const [
    currentGame,
    lastTerminatedGame,
  ] = await Promise.all([
    gameRepository.getCurrentGame(currentAppUser),
    gameRepository.getLastTerminatedGame(currentAppUser),
  ]);
  const game = currentGame ?? lastTerminatedGame;

  if (!game) {
    throw redirect('/new');
  }

  return {
    roundInfos: game.roundInfos.slice(0, game.roundResults.length),
    roundResults: game.roundResults,
    playersInOrder: game.playersInOrder,
    roundScores: game.getRoundScores(),
    isTerminated: game.isTerminated(),
  };
}

export default function ScoresRoute({ loaderData }: Route.ComponentProps) {
  const {
    roundScores,
    roundInfos,
    isTerminated,
    roundResults,
    playersInOrder
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