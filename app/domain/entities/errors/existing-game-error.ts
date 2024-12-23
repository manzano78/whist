import { createBusinessError } from '~/domain/entities/errors/error-factory';

const [createExistingGameError, isExistingGameError] = createBusinessError(() => ({
  message: "A game already exists",
  props: {}
}));

export {
  createExistingGameError,
  isExistingGameError
};
