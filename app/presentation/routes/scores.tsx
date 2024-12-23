import { redirect } from 'react-router';
import { getCurrentAppUser } from '~/presentation/infrastructure/app-user-tmp-mock';
import { Route } from './+types/scores';
import { Scores } from '~/presentation/features/display-scores';
import { gameRepository } from '~/data/game-repository-impl';

export async function loader({ request }: Route.LoaderArgs) {
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