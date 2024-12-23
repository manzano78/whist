import { createBusinessError } from '~/domain/entities/errors/error-factory';

const [createIdReassignError, isIdReassignError] = createBusinessError(() => ({
  message: "Impossible to assign an ID to an entity that already has one",
  props: {}
}));

export {
  createIdReassignError,
  isIdReassignError
};
