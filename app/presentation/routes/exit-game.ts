import { getCurrentAppUser } from '~/presentation/infrastructure/app-user-tmp-mock';
import { redirect } from 'react-router';
import { Route } from './+types/exit-game';
import { gameRepository } from '~/data/game-repository-impl';

export async function action({ request }: Route.ActionArgs) {
  const currentAppUser = await getCurrentAppUser(request);
  const currentGame = await gameRepository.getCurrentGame(currentAppUser);

  if (currentGame) {
    await gameRepository.deleteGame(currentGame);
  }

  return redirect('/new')
}