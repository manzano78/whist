import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Link, useNavigation } from 'react-router';
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import type { Ranking } from '~/domain/entities/ranking';
import { IsMobileContext } from '~/presentation/contexts/is-mobile-context';
import { use } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface RankingPreviewProps {
  ranking: Ranking;
  gameId: string;
}

export function RankingPreview(
  {
    gameId,
    ranking,
  }: RankingPreviewProps
) {
  const isMobile = use(IsMobileContext);
  const navigation = useNavigation();
  const detailedScoresPath = `/games/${gameId}/scores`;

  const content = (
    <>
      <ul>
        {ranking.map(({player, index, isExAequoWithPrevious, cumulativePoints}) => (
          <li key={player}>
            {index}<sup>{index === 1 ? 'er' : 'ème'}</sup>&nbsp;{isExAequoWithPrevious && ' ex æquo '}:&nbsp;
            <strong>{player}</strong> ({cumulativePoints})
          </li>
        ))}
      </ul>

      <Box marginTop={4}>
        <LoadingButton
          component={Link}
          size="large"
          variant="outlined"
          to={detailedScoresPath}
          startIcon={<SportsScoreIcon/>}
          loadingPosition="start"
          loading={navigation.state === 'loading' && navigation.location.pathname === detailedScoresPath}
        >
          Scores détaillés
        </LoadingButton>
      </Box>
    </>
  );
  return isMobile ? (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
      >
        <Typography component="span">
          <strong>Classement provisoire</strong>
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        {content}
      </AccordionDetails>
    </Accordion>
  ) : (
    <>
      <Typography variant="h2">
        Classement provisoire
      </Typography>
      <Box marginTop={4}>
        {content}
      </Box>
    </>
  )
}