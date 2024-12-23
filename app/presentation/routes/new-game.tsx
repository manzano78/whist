import { data, redirect, type ShouldRevalidateFunction } from 'react-router';
import type { Route } from './+types/new-game';
import { isMinPlayersError } from '~/domain/entities/errors/min-players-error';
import { isPlayerDuplicatesError } from '~/domain/entities/errors/duplicate-players-error';
import { stringifyDuplicatedPlayersMessage } from '~/presentation/features/create-new-game/utils';
import { CreateNewGameForm } from '~/presentation/features/create-new-game/components/create-new-game-form';
import { Box } from '@mui/material';
import { getApp } from '~/presentation/infrastructure/app';

export async function loader({ request, context }: Route.LoaderArgs) {
  const { gameRepository, getCurrentAppUser } = getApp(context);
  const currentAppUser = await getCurrentAppUser(request);
  const [
    currentGame,
    lastTerminatedGame
  ] = await Promise.all([
    gameRepository.getCurrentGame(currentAppUser),
    gameRepository.getLastTerminatedGame(currentAppUser),
  ]);

  if (currentGame) {
    throw redirect('/');
  }

  const defaultPlayers = lastTerminatedGame?.playersInOrder;
  const existingPlayers = [...currentAppUser.players].sort();

  return { existingPlayers, defaultPlayers };
}

export async function action({ request, context }: Route.ActionArgs) {
  const { gameRepository, getCurrentAppUser, createNewGameUseCase } = getApp(context);
  const [formData, currentAppUser] = await Promise.all([
    request.formData(),
    getCurrentAppUser(request)
  ]);
  const playersInOrder = formData.getAll('player') as string[];

  try {
    await createNewGameUseCase.createNewGame(currentAppUser, playersInOrder);
  } catch (error) {
    let errorMessage: string | undefined;

    if (isMinPlayersError(error)) {
      errorMessage = 'Il faut au moins deux joueurs pour démarrer une partie';
    } else if (isPlayerDuplicatesError(error)) {
      errorMessage = stringifyDuplicatedPlayersMessage(error.duplicatedPlayers);
    } else {
      throw error;
    }

    return data({ errorMessage }, 400);
  }

  // todo => return when PR is released
  throw redirect('/');
}

export const shouldRevalidate: ShouldRevalidateFunction = ({ defaultShouldRevalidate }) => defaultShouldRevalidate;

export default function NewGameRoute({ loaderData, actionData }: Route.ComponentProps) {
  const { existingPlayers, defaultPlayers } = loaderData;

  return (
    <Box padding={1}>
      <CreateNewGameForm
        defaultPlayers={defaultPlayers}
        existingPlayers={existingPlayers}
        errorMessage={actionData?.errorMessage}
      />
    </Box>
  );
}
