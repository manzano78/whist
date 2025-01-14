import type { Route } from "./+types/home";
import { getApp } from '~/presentation/infrastructure/app';
import { redirect } from 'react-router';

export async function loader({ context, request }: Route.LoaderArgs) {
  // const { gameRepository, getCurrentAppUser } = getApp(context);
  // const currentAppUser = await getCurrentAppUser(request);
  // const currentGame = await gameRepository.getCurrentGame(currentAppUser);
  //
  // if (currentGame) {
  //   return redirect(`/games/${currentGame.getId()}/play`);
  // }

  return redirect('/games');
}