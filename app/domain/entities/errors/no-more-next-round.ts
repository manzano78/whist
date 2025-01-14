import { createBusinessError } from '~/domain/entities/errors/error-factory';

const [createNoMoreNextRoundError, isNoMoreNextRoundError] = createBusinessError(() => ({
  message: "There is no more next round for this game",
  props: {}
}));

export {
  createNoMoreNextRoundError,
  isNoMoreNextRoundError
};
