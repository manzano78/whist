import type { AppLoadContext } from 'react-router';
import { AppUserRepositoryImpl } from '~/data/app-user-repository-impl';
import { GameRepositoryImpl } from '~/data/game-repository-impl';
import { CreateNewGameUseCase } from '~/domain/use-cases/create-new-game';
import type { AppUser } from '~/domain/entities/app-user';
import { RoundResultRepositoryImpl } from '~/data/round-result-repository-impl';
import { GetGameUseCase } from '~/domain/use-cases/get-game-use-case';
import { SaveRoundResultsUseCase } from '~/domain/use-cases/save-round-results-use-case';
import { RoundDraftRepositoryImpl } from '~/data/round-draft-repository-impl';
import { SaveRoundDraftUseCase } from '~/domain/use-cases/save-round-draft-use-case';

const TEMPORARY_defaultAppUser = {
  username: 'manzano',
  nickname: 'Mika',
}

export function getApp({ prismaClient }: AppLoadContext) {
  const appUserRepository = new AppUserRepositoryImpl(prismaClient);
  const roundResultRepository = new RoundResultRepositoryImpl(prismaClient);
  const gameRepository = new GameRepositoryImpl(prismaClient);
  const roundDraftRepository = new RoundDraftRepositoryImpl(prismaClient);
  const createNewGameUseCase = new CreateNewGameUseCase(appUserRepository, gameRepository);
  const getGameUseCase = new GetGameUseCase(gameRepository);
  const saveRoundDraftUseCase = new SaveRoundDraftUseCase(roundDraftRepository);
  const saveRoundResultsUseCase = new SaveRoundResultsUseCase(roundResultRepository, roundDraftRepository);

  const TEMPORARY_getCurrentAppUser: (_: Request) => Promise<AppUser> = async () => {
    let appUser = await appUserRepository.getAppUserByUsername(TEMPORARY_defaultAppUser.username);

    if (!appUser) {
      appUser = await appUserRepository.createAppUser(
        TEMPORARY_defaultAppUser.username,
        TEMPORARY_defaultAppUser.nickname
      );
    }

    return appUser;
  }

  return {
    appUserRepository,
    gameRepository,
    roundResultRepository,
    createNewGameUseCase,
    getGameUseCase,
    saveRoundResultsUseCase,
    saveRoundDraftUseCase,
    roundDraftRepository,
    getCurrentAppUser: TEMPORARY_getCurrentAppUser,
  };
}
