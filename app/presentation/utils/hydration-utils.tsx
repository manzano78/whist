import { type ReactNode, useSyncExternalStore } from 'react';

interface ClientOnlyProps {
  fallback?: ReactNode | (() => ReactNode);
  children?: ReactNode | (() => ReactNode);
}

function subscribe() {
  return () => {/* noop */};
}

export function useIsHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

export function ClientOnly({fallback, children}: ClientOnlyProps) {
  const isHydrated = useIsHydrated();
  const nodeToRender = isHydrated ? children : fallback;

  return <>{typeof nodeToRender === 'function' ? nodeToRender() : nodeToRender}</>;
}