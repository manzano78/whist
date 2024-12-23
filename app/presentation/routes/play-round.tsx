import { data, redirect } from 'react-router';
import type { Route } from './+types/play-round';
import type { RoundResult } from '~/domain/entities/round-result';
import { PlayRound } from '~/presentation/features/play-round';
import { getApp } from '~/presentation/infrastructure/app';

export async function loader({ request, context }: Route.LoaderArgs) {
  const { gameRepository, getCurrentAppUser } = getApp(context);
  const currentAppUser = await getCurrentAppUser(request);
  const currentGame = await gameRepository.getCurrentGame(currentAppUser);

  if (!currentGame) {
    throw redirect('/new');
  }

  const nextRound = currentGame.getNextRoundInfo();

  if (!nextRound) {
    throw redirect('/scores');
  }

  const gameId = currentGame.getId()!;
  const roundId = `${gameId}-${nextRound.index}`;

  return {
    roundId,
    gameId: String(gameId),
    round: nextRound,
    ranking: currentGame.getRanking(),
    totalRounds: currentGame.totalRounds,
  };
}

export async function action({ request, context }: Route.ActionArgs) {
  const { gameRepository, getCurrentAppUser, saveRoundResultUseCase } = getApp(context);
  const currentAppUser = await getCurrentAppUser(request);
  const currentGame = await gameRepository.getCurrentGame(currentAppUser);

  if (!currentGame) {
    throw data({ message: "Il n'y a aucune partie en cours" }, 400);
  }

  const formData = await request.formData();
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

  await saveRoundResultUseCase.saveRoundResult(roundResult, currentGame);

  if (currentGame.isTerminated()) {
    return redirect('/scores')
  }

  return redirect('/');
}

export default function PlayGameRoute({ loaderData }: Route.ComponentProps) {
  const { round, ranking, totalRounds, gameId, roundId } = loaderData;

  return (
    <PlayRound
      key={roundId}
      round={round}
      gameId={gameId}
      roundId={roundId}
      totalRounds={totalRounds}
      ranking={ranking}
    />
  );
}