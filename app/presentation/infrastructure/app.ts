import type { AppLoadContext } from 'react-router';
import { AppUserRepositoryImpl } from '~/data/app-user-repository-impl';
import { GameRepositoryImpl } from '~/data/game-repository-impl';
import { CreateNewGameUseCase } from '~/domain/use-cases/create-new-game';
import { SaveRoundResultUseCase } from '~/domain/use-cases/save-round-result';
import type { AppUser } from '~/domain/entities/app-user';

const TEMPORARY_defaultAppUser: AppUser = {
  id: null,
  username: 'manzano',
  nickname: 'Mika',
  players: [],
}

export function getApp({ prismaClient }: AppLoadContext) {
  const appUserRepository = new AppUserRepositoryImpl(prismaClient);
  const gameRepository = new GameRepositoryImpl(prismaClient);
  const createNewGameUseCase = new CreateNewGameUseCase(appUserRepository, gameRepository);
  const saveRoundResultUseCase = new SaveRoundResultUseCase(gameRepository);

  const TEMPORARY_getCurrentAppUser: (_: Request) => Promise<AppUser> = async () => {
    let appUser = await appUserRepository.getAppUser(TEMPORARY_defaultAppUser.username);

    if (!appUser) {
      appUser = TEMPORARY_defaultAppUser;
      await appUserRepository.saveAppUser(appUser);
    }

    return appUser;
  }

  return {
    appUserRepository,
    gameRepository,
    createNewGameUseCase,
    saveRoundResultUseCase,
    getCurrentAppUser: TEMPORARY_getCurrentAppUser,
  };
}
