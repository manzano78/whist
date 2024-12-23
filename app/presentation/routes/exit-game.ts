import { redirect } from 'react-router';
import type { Route } from './+types/exit-game';
import { getApp } from '~/presentation/infrastructure/app';

export async function action({ request, context }: Route.ActionArgs) {
  const { getCurrentAppUser, gameRepository } = getApp(context);
  const currentAppUser = await getCurrentAppUser(request);
  const currentGame = await gameRepository.getCurrentGame(currentAppUser);

  if (currentGame) {
    await gameRepository.deleteGame(currentGame);
  }

  return redirect('/new')
}