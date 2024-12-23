import { createBusinessError } from '~/domain/entities/errors/error-factory';

const [createMinPlayersError, isMinPlayersError] = createBusinessError(() => ({
  message: "A game can't start with less than two players",
  props: {}
}));

export {
  createMinPlayersError,
  isMinPlayersError
};
