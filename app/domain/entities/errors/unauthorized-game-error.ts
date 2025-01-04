import { createBusinessError } from '~/domain/entities/errors/error-factory';

const [createUnauthorizedGameError, isUnauthorizedGameError] = createBusinessError(() => ({
  message: "This game doesn't belong to the current app user",
  props: {}
}));

export {
  createUnauthorizedGameError,
  isUnauthorizedGameError
};
