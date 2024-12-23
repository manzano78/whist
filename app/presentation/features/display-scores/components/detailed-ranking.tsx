import { Table, TableBody, TableCell, TableRow } from '@mui/material';
import { RoundScore } from '~/domain/entities/round-score';

interface DetailedRankingProps {
  lastRoundScore: RoundScore;
}

export function DetailedRanking({ lastRoundScore }: DetailedRankingProps) {
  const { results, cumulativeRanking } = lastRoundScore;

  return (
    <Table>
      <TableBody>
        {cumulativeRanking.map(({ player, isExAequoWithPrevious, index }) => {
          const {
            cumulativePoints,
            cumulativeWonCalls,
            cumulativeLostRounds,
            cumulativeWonRounds,
            cumulativeCalls,
          } = results[player];

          return (
            <TableRow key={player}>
              <TableCell>
                {index === 1 && !isExAequoWithPrevious && '🥇'}
                {index === 2 && !isExAequoWithPrevious && '🥈'}
                {index === 3 && !isExAequoWithPrevious && '🥉'}
                {(index > 3 && !isExAequoWithPrevious) && <>{index}<sup>ème</sup></>}
                {isExAequoWithPrevious && '-'}
              </TableCell>
              <TableCell>
                <strong>{player}</strong>
              </TableCell>
              <TableCell>
                <strong>{cumulativePoints}</strong> point{cumulativePoints !== 0 ? 's' : ''}
              </TableCell>
              <TableCell>
                <strong>{cumulativeWonRounds}</strong> tour{cumulativeWonRounds > 1 ? 's' : ''} gagné{cumulativeWonRounds > 1 ? 's' : ''}, <strong>{cumulativeLostRounds}</strong> perdu{cumulativeLostRounds > 1 ? 's' : ''}
              </TableCell>
              <TableCell>
                <strong>{cumulativeWonCalls}</strong> pli{cumulativeWonCalls > 1 ? 's' : ''} gagné{cumulativeWonCalls > 1 ? 's' : ''} sur <strong>{cumulativeCalls}</strong> demandé{cumulativeCalls > 1 ? 's' : ''}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  )
}