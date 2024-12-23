import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index('presentation/routes/play-round.tsx'),
  route('new', 'presentation/routes/new-game.tsx'),
  route('exit', 'presentation/routes/exit-game.ts'),
  route('scores', 'presentation/routes/scores.tsx'),
  route('*', 'presentation/routes/catch-all.ts'),
] satisfies RouteConfig;
