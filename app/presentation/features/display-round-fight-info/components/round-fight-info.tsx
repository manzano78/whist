import { useState } from 'react';
import { Alert, Box } from '@mui/material';

interface RegisterRoundResultsFormProps {
  defaultTotalCardsPerPlayer: number;
  defaultCalls: { [player: string]: number };
}

export function RoundFightInfo(
  {
    defaultCalls,
    defaultTotalCardsPerPlayer,
  }: RegisterRoundResultsFormProps) {
  const [{ isFight, delta }] = useState(() => {
    const totalCalls = Object.values(defaultCalls).reduce((acc, call) => acc + call, 0);
    const isFight = totalCalls > defaultTotalCardsPerPlayer;
    const delta = Math.abs(totalCalls - defaultTotalCardsPerPlayer);

    return {
      isFight,
      delta,
    };
  });

  return (
    <Box width="max-content">
      <Alert variant="filled" severity="info">
        <strong>{isFight ? 'ON SE BAT' : 'ON NE SE BAT PAS'}</strong> de <strong>{delta}</strong> !
      </Alert>
    </Box>
  );
}