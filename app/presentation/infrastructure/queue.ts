export function createQueue() {
  let promise: Promise<unknown> = Promise.resolve();

  return <T>(action: () => Promise<T>) => promise = promise.then(action, action);
}
