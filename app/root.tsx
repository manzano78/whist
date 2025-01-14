import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration, useLoaderData,
} from 'react-router';

import type { Info, Route } from './+types/root';
import type { ReactNode } from 'react';
import stylesheetUrl from './presentation/assets/styles.css?url';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { ClientOnly } from '~/presentation/utils/hydration';
import { theme } from '~/presentation/infrastructure/theming/theme';
import faviconUrl from '~/presentation/assets/favicon.png?url';
import { isMobileUserAgent } from '~/presentation/utils/user-agent-utils';
import { IsMobileContext } from '~/presentation/contexts/is-mobile-context';
import { MainLayout } from '~/presentation/features/display-main-layout';

export const links: Route.LinksFunction = () => [
  { rel: 'stylesheet', href: stylesheetUrl },
  { rel: 'icon', href: faviconUrl },
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
  { rel: 'stylesheet', href: 'https://fonts.googleapis.com/icon?family=Material+Icons' },
  { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap' },
];

export function loader({ request }: Route.LoaderArgs) {
  const isMobile = isMobileUserAgent(request.headers.get('User-Agent'));

  return { isMobile }
}

export function Layout({ children }: { children: ReactNode }) {
  const rootLoaderData = useLoaderData<Info['loaderData']>();
  const isMobile = rootLoaderData?.isMobile ?? false;

  return (
    <html lang="fr" data-color-scheme="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Whist</title>
        <Meta />
        <Links />
      </head>
      <body>
        <ThemeProvider theme={theme}>
          <ClientOnly>
            <CssBaseline />
            <IsMobileContext value={isMobile}>
              <MainLayout>
                {children}
              </MainLayout>
            </IsMobileContext>
          </ClientOnly>
        </ThemeProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
