import { type RouteConfig, index, route, prefix } from "@react-router/dev/routes";

export default [
  index('presentation/routes/home.tsx'),
  ...prefix('games', [
    index('presentation/routes/game-list.tsx'),
    route('new', 'presentation/routes/new-game.tsx'),
    ...prefix(':gameId', [
      route('play', 'presentation/routes/play-round.tsx'),
      route('scores', 'presentation/routes/scores.tsx'),
    ]),
  ]),
  route('*', 'presentation/routes/catch-all.ts'),
] satisfies RouteConfig;
