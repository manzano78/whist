import { createBusinessError } from '~/domain/entities/errors/error-factory';

const [createTerminatedGameError, isTerminatedGameError] = createBusinessError(() => ({
  message: "Impossible to add a round result to a terminated game",
  props: {},
}));

export {
  createTerminatedGameError,
  isTerminatedGameError
};
