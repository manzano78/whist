import type { RoundScore } from '~/domain/entities/round-score';
import type { RoundInfo } from '~/domain/entities/round-info';
import type { RoundResult } from '~/domain/entities/round-result';
import { Box, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import NorthEastIcon from '@mui/icons-material/NorthEast';
import SouthEastIcon from '@mui/icons-material/SouthEast';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import type { RoundDirection } from '~/domain/entities/round-direction';
import type { ReactElement } from 'react';

interface DetailedRoundsProps {
  roundScores: RoundScore[];
  roundInfos: RoundInfo[];
  roundResults: RoundResult[];
  playersInOrder: string[];
}

const directionIcons: Record<RoundDirection, ReactElement> = {
  asc: <NorthEastIcon />,
  desc: <SouthEastIcon />,
  'no-trump': <ArrowRightAltIcon />,
  'no-trump-1': <ArrowRightAltIcon />,
  'no-trump-2': <ArrowRightAltIcon />,
};

export function DetailedRounds(
  {
    roundResults,
    roundInfos,
    roundScores,
    playersInOrder,
  }: DetailedRoundsProps
) {
  return (
    <Table>
      <TableHead sx={(theme) => ({
        position: 'sticky',
        top: 0,
        zIndex: 1,
        backgroundColor: theme.palette.background.default,
      })}>
        <TableRow>
          <TableCell />
          {playersInOrder.map((player) => (
            <TableCell key={player}>
              <strong>{player}</strong>
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {roundInfos.map(({ dealer, index, direction, totalCardsPerPlayer }, i) => {
          const { results, cumulativeRanking } = roundScores[i];
          const roundResult = roundResults[i];

          const {
            indexMultiplePlayers,
            playerPositions,
          } = cumulativeRanking.reduce(({ indexMultiplePlayers, playerPositions }, { player, isExAequoWithPrevious, index }) => {
            indexMultiplePlayers[index] = isExAequoWithPrevious;
            playerPositions[player] = index;

            return {
              indexMultiplePlayers,
              playerPositions
            };
          }, {
            indexMultiplePlayers: {},
            playerPositions: {},
          } as {
            indexMultiplePlayers: { [index: number]: boolean };
            playerPositions: { [players: string]: number };
          });

          return (
            <TableRow key={index}>
              <TableCell>
                <Box display="flex" alignItems="center">
                  <strong>
                    #{index}
                  </strong>
                  &nbsp;
                  {directionIcons[direction]}
                </Box>
                <Box>
                  <strong>{totalCardsPerPlayer}</strong>&nbsp;carte{totalCardsPerPlayer > 1 ? 's' : ''}
                </Box>
              </TableCell>
              {playersInOrder.map((player) => {
                const {
                  call,
                  result
                } = roundResult[player];
                const {
                  points,
                  cumulativePoints,
                  cumulativeCalls,
                  cumulativeWonCalls,
                  cumulativeWonRounds,
                  cumulativeLostRounds,
                } = results[player];
                const isDealer = player === dealer;
                const isSuccess = call === result;
                const index = playerPositions[player];
                const isExAequo = indexMultiplePlayers[index];

                return (
                  <TableCell
                    key={player}
                    sx={(theme) => ({
                      padding: '0.5rem',
                      position: 'relative',
                      border: `solid 1px ${theme.palette.divider}`,
                      backgroundColor: isSuccess ? theme.palette.success.main : theme.palette.warning.main
                    })}
                  >
                    {isDealer && (
                      <Box
                        width={10}
                        height={10}
                        right="0.5rem"
                        top="0.5rem"
                        borderRadius="50%"
                        position="absolute"
                        sx={(theme) => ({backgroundColor: theme.palette.text.primary})}
                      />
                    )}
                    <ul>
                      <li>
                        <strong>{result}</strong> pli{result > 1 ? 's' : ''} obtenu{result > 1 ? 's' : ''} sur <strong>{call}</strong> demandé{call > 1 ? 's' : ''}
                      </li>
                    </ul>
                    <Box display="flex" alignItems="center">
                      <ArrowRightAltIcon  />&nbsp;
                      <strong>{points}</strong>&nbsp;point{points !== 0 ? 's' : ''}
                    </Box>
                    <Box marginY={2}>
                      <strong>Cumul :</strong>
                    </Box>
                    <ul>
                      <li>
                        <strong>{cumulativePoints}</strong> point{cumulativePoints !== 0 ? 's' : ''}
                      </li>
                      <li>
                        <strong>{cumulativeWonRounds}</strong> tour{cumulativeWonRounds > 1 ? 's' : ''} gagné{cumulativeWonRounds > 1 ? 's' : ''}, <strong>{cumulativeLostRounds}</strong> perdu{cumulativeLostRounds > 1 ? 's' : ''}
                      </li>
                      <li>
                        <strong>{cumulativeWonCalls}</strong> pli{cumulativeWonCalls > 1 ? 's' : ''} gagné{cumulativeWonCalls > 1 ? 's' : ''} sur <strong>{cumulativeCalls}</strong> demandé{cumulativeCalls > 1 ? 's' : ''}
                      </li>
                    </ul>
                    <Box display="flex" alignItems="center">
                      <ArrowRightAltIcon  />&nbsp;
                      <strong>{index}<sup>{index === 1 ? 'er' : 'ème'}</sup>{isExAequo && ' ex æquo'}</strong>
                    </Box>
                  </TableCell>
                )
              })}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

