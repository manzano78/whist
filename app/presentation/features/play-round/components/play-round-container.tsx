import type { RoundInfo } from '~/domain/entities/round-info';
import type { Ranking } from '~/domain/entities/ranking';
import { useState } from 'react';
import { PlayRound } from './play-round';

interface PlayRoundContainerProps {
  round: RoundInfo;
  totalRounds: number;
  ranking: Ranking;
  gameId: string;
  roundId: string;
}

export function PlayRoundContainer(
  {
    round,
    totalRounds,
    ranking,
    gameId,
    roundId,
  }: PlayRoundContainerProps
) {
  const [subRoundKey, setSubRoundKey] = useState(0);
  const replayRound = () => setSubRoundKey((subRoundKey) => subRoundKey + 1);

  return (
    <PlayRound
      key={subRoundKey}
      gameId={gameId}
      roundId={roundId}
      round={round}
      totalRounds={totalRounds}
      ranking={ranking}
      replayRound={replayRound}
    />
  )
}