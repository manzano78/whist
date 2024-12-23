import { createBusinessError } from '~/domain/entities/errors/error-factory';

const [createPlayerDuplicatesError, isPlayerDuplicatesError] = createBusinessError((duplicatedPlayers: string[]) => ({
  message: "A game can't have players duplicates",
  props: {
    duplicatedPlayers
  }
}));

export {
  createPlayerDuplicatesError,
  isPlayerDuplicatesError
};
