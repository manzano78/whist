import type { ReactNode } from 'react';
import { useIsHydrated } from '~/presentation/utils/hydration/hooks/use-is-hydrated';

interface ClientOnlyProps {
  fallback?: ReactNode | (() => ReactNode);
  children?: ReactNode | (() => ReactNode);
}

export function ClientOnly({ fallback, children }: ClientOnlyProps) {
  const isHydrated = useIsHydrated();
  const nodeToRender = isHydrated ? children : fallback;

  return <>{typeof nodeToRender === 'function' ? nodeToRender() : nodeToRender}</>;
}
