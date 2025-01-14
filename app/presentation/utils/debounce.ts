export function createDebounce(delayInMs: number) {
  let timeoutId: number | undefined;

  return (action: () => void) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(action, delayInMs);
  };
}
