import { type CSSProperties, type PropsWithChildren, use, useEffect } from 'react';
import { useNavigationConfig } from '~/presentation/features/display-main-layout/hooks/use-navigation-config';
import { Header } from '~/presentation/features/display-main-layout/components/header';
import { Box } from '@mui/material';
import { IsMobileContext } from '~/presentation/contexts/is-mobile-context';

type LayoutProps = PropsWithChildren<{}>;

const MOBILE_HEADER_HEIGHT_PX = 56;
const DESKTOP_HEADER_HEIGHT_PX = 64;

export function MainLayout({ children }: LayoutProps) {
  const navigationConfig = useNavigationConfig();
  const isMobile = use(IsMobileContext);
  const headerHeight = isMobile ? MOBILE_HEADER_HEIGHT_PX : DESKTOP_HEADER_HEIGHT_PX;

  return (
    <>
      {navigationConfig && (
        <Header navigationConfig={navigationConfig} />
      )}
      <Box
        padding={`${navigationConfig ? `${headerHeight}px` : '0'} 0 0 0`}
        width="100%"
        height="100%"
      >
        {children}
      </Box>
    </>
  );
}
