import { CreateNewGameUseCase } from '~/domain/use-cases/create-new-game';
import { SaveRoundResultUseCase } from '~/domain/use-cases/save-round-result';
import { appUserRepository } from '~/data/app-user-repository-impl';
import { gameRepository } from '~/data/game-repository-impl';

export const createNewGameUseCase = new CreateNewGameUseCase(appUserRepository, gameRepository);

export const saveRoundResultUseCase = new SaveRoundResultUseCase(gameRepository);
