import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  ssr: {
    noExternal: [
      '@mui/material',
      '@mui/icons-material',
      '@mui/utils',
      '@mui/system',
      '@mui/styled-engine',
    ]
  },
  plugins: [reactRouter(), tsconfigPaths(), tailwindcss()],
});
