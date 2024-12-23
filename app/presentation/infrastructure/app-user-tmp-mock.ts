import type { AppUser } from '~/domain/entities/app-user';
import { appUserRepository } from '~/data/app-user-repository-impl';

const defaultAppUser: AppUser = {
  id: null,
  username: 'manzano',
  nickname: 'Mika',
  players: [],
}

export async function getCurrentAppUser(_: Request): Promise<AppUser> {
  let appUser = await appUserRepository.getAppUser(defaultAppUser.username);

  if (!appUser) {
    appUser = defaultAppUser;
    await appUserRepository.saveAppUser(appUser);
  }

  return appUser;
}
