import { createTheme } from '@mui/material';

export const theme = createTheme({
  colorSchemes: {
    dark: true,
  },
  typography: {
    h1: {
      fontSize: '2rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '1.25rem',
      fontWeight: 700,
    }
  }
});
