import { AppBar, Box, IconButton, Toolbar, Typography } from '@mui/material';
import { Link } from 'react-router';
import type { NavigationConfig } from '~/presentation/features/display-main-layout/types';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

interface HeaderProps {
  navigationConfig: NavigationConfig;
}

export function Header({ navigationConfig }: HeaderProps) {
  return (
    <AppBar position="fixed">
      <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
        <Box width={56} textAlign="center">
          {navigationConfig.backUrl ? (
            <IconButton to={navigationConfig.backUrl} component={Link}>
              <ArrowBackIosNewIcon/>
            </IconButton>
          ) : null}
        </Box>
        <Box textAlign="center">
          {typeof navigationConfig.title === 'string' ? (
            <Typography variant="h2">
              {navigationConfig.title}
            </Typography>
          ) : navigationConfig.title}
        </Box>
        <Box width={56} textAlign="center">
          {navigationConfig.hasNewGameLink && (
            <IconButton>
              <MenuIcon/>
            </IconButton>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}