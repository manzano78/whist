import { createBusinessError } from '~/domain/entities/errors/error-factory';

const [createOutOfSyncRoundSubmissionError, isOutOfSyncRoundSubmissionError] = createBusinessError((expected: number, received: number) => ({
  message: `Out of sync round submission - Expected ${expected}, received ${received}.`,
  props: {

  }
}));

export {
  createOutOfSyncRoundSubmissionError,
  isOutOfSyncRoundSubmissionError
};
