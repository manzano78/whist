import { AppUser } from '~/domain/entities/app-user';

export function addPlayersToAppUser(players: string[], appUser: AppUser): boolean {
  const distinctPlayers = new Set(appUser.players);

  let didAddAtLeastOneNewPlayer = false;

  for (const player of players) {
    if (!distinctPlayers.has(player)) {
      distinctPlayers.add(player);
      didAddAtLeastOneNewPlayer = true;
    }
  }

  if (didAddAtLeastOneNewPlayer) {
    appUser.players = Array.from(distinctPlayers);
  }

  return didAddAtLeastOneNewPlayer;
}
