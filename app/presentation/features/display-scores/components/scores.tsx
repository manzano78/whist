import { Box, Button, Typography } from '@mui/material';
import { RoundScore } from '~/domain/entities/round-score';
import { RoundInfo } from '~/domain/entities/round-info';
import { Link } from 'react-router';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AutoRenewIcon from '@mui/icons-material/Autorenew';
import { DetailedRanking } from './detailed-ranking';
import { RoundResult } from '~/domain/entities/round-result';
import { DetailedRounds } from '~/presentation/features/display-scores/components/detailed-rounds';

interface ScoresProps {
  roundScores: RoundScore[];
  roundInfos: RoundInfo[];
  roundResults: RoundResult[];
  playersInOrder: string[];
  isTerminated: boolean;
}

export function Scores({ roundScores, isTerminated, roundResults, roundInfos, playersInOrder } : ScoresProps) {
  return (
    <Box padding={2} position="relative">
      <Box position="absolute" right={16}>
        <Button
          variant="outlined"
          component={Link}
          to={isTerminated ? '/new' : '/'}
          startIcon={isTerminated ? <AutoRenewIcon /> : <ArrowBackIcon />}
        >
          {isTerminated ? 'Nouvelle partie' : 'Retour à la partie'}
        </Button>
      </Box>
      <Typography variant="h1">
        {isTerminated ? 'Fin de la partie !' : 'Scores provisoires'}
      </Typography>

      <Box marginTop={4}>
        <Typography variant="h2">
          Classement
        </Typography>
      </Box>

      {roundScores.length === 0 ? (
        <Box>La partie n'ayant pas encore débuté, aucun score ne peut être affiché pour le moment</Box>
      ) : (
        <>
          <Box marginTop={1}>
            <DetailedRanking lastRoundScore={roundScores[roundScores.length - 1]} />
          </Box>
          <Box marginTop={6}>
            <Typography variant="h2">
              Détails par tour
            </Typography>
          </Box>
          <Box>
            <DetailedRounds
              roundInfos={roundInfos}
              roundResults={roundResults}
              roundScores={roundScores}
              playersInOrder={playersInOrder}
            />
          </Box>
        </>
      )}
    </Box>
  );
}
