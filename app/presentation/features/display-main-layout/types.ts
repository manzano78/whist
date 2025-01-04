import type { ReactNode } from 'react';

export interface NavigationConfig {
  title: ReactNode;
  backUrl?: string | null | false | undefined | 0;
  hasNewGameLink: boolean;
}
