type ErrorCreator<Args extends unknown[], P> = (...args: Args) => Error & P;
type IsError<P> = (arg: unknown) => arg is Error & P;

const PRIVATE_TYPE_PROP_NAME = '_type';

let seqId = 0;

export function createBusinessError<Args extends unknown[], P>(
  init: (...args: Args) => {
    message: string;
    errorOptions?: ErrorOptions;
    props: P;
  },
): [ErrorCreator<Args, P>, IsError<P>] {
  const id = seqId++;
  const errorType = `whist-business-error-${id}`;

  const createError = (...args: Args): Error & P => {
    const { message, props, errorOptions } = init(...args);
    const error = new Error(message, errorOptions);

    Object.assign(error, props, { [PRIVATE_TYPE_PROP_NAME]: errorType });

    return error as Error & P;
  }

  function isError(error: unknown): error is Error & P {
    return error instanceof Error && PRIVATE_TYPE_PROP_NAME in error && error[PRIVATE_TYPE_PROP_NAME] === errorType;
  }

  return [createError, isError];
}
