import { type UIMatch, useMatches } from 'react-router';
import { type ReactNode, useMemo } from 'react';
import type { NavigationConfig } from '~/presentation/features/display-main-layout/types';

export function useNavigationConfig(): NavigationConfig | null {
  const matches = useMatches() as UIMatch<unknown, RouteHandle>[];

  return useMemo(
    () => {
      for (let i = matches.length - 1; i >= 0; i -= 1) {
        const match = matches[i];
        const navigationConfig = match.handle?.navigationConfig;

        if (navigationConfig) {
          const {
            title,
            backUrl,
            hasNewGameLink = false,
          } = navigationConfig;

          let finalTitle: ReactNode;

          if (typeof title === 'function') {
            finalTitle = match.data ? title(match.data) : null;
          } else {
            finalTitle = title;
          }

          let finalBackUrl: string | undefined | null | false | 0;

          if (typeof backUrl === 'function') {
            finalBackUrl = backUrl({ params: match.params, loaderData: match.data });
          } else {
            finalBackUrl = backUrl;
          }

          return {
            hasNewGameLink,
            backUrl: finalBackUrl,
            title: finalTitle,
          };
        }
      }

      return null;
    },
    [matches]
  );
}
