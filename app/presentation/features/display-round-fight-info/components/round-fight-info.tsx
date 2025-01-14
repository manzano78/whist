import { useMemo } from 'react';
import { Alert, Box } from '@mui/material';

interface RegisterRoundResultsFormProps {
  totalCardsPerPlayer: number;
  calls: number[];
}

export function RoundFightInfo(
  {
    calls,
    totalCardsPerPlayer,
  }: RegisterRoundResultsFormProps) {
  const {
    isFight,
    delta,
  } = useMemo(() => {
    const totalCalls = calls.reduce((acc, call) => acc + call, 0);
    const isFight = totalCalls > totalCardsPerPlayer;
    const delta = Math.abs(totalCalls - totalCardsPerPlayer);

    return {
      isFight,
      delta,
    };
  }, [calls, totalCardsPerPlayer]);

  return (
    <Box width="max-content">
      <Alert variant="filled" severity={isFight ? 'warning' : 'info'}>
        <strong>{isFight ? 'ON SE BAT' : 'ON NE SE BAT PAS'}</strong> de <strong>{delta}</strong> !&nbsp;
        {isFight ? '🔥' : '🥶'}
      </Alert>
    </Box>
  );
}