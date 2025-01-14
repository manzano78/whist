import type { RoundDirection } from '~/domain/entities/round-direction';
import { Box, Typography } from '@mui/material';
import type { ReactElement } from 'react';
import NorthEastIcon from '@mui/icons-material/NorthEast';
import SouthEastIcon from '@mui/icons-material/SouthEast';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';

interface RoundTitleProps {
  roundIndex: number;
  totalRounds: number;
  direction: RoundDirection;
}

const directionIcons: Record<RoundDirection, ReactElement> = {
  asc: <NorthEastIcon />,
  desc: <SouthEastIcon />,
  'no-trump': <ArrowRightAltIcon />,
  'no-trump-1': (
    <>
      <ArrowRightAltIcon />
      <sub>
        <small>#1</small>
      </sub>
    </>
  ),
  'no-trump-2': (
    <>
      <ArrowRightAltIcon />
      <sub>
        <small>#2</small>
      </sub>
    </>
  ),
};

export function RoundTitle(
  {
    roundIndex,
    totalRounds,
    direction,
  }: RoundTitleProps
) {
  return (
    <Box display="flex" gap={1} alignItems="baseline">
      <Typography variant="h2">
        Tour {roundIndex}
        <small>/{totalRounds}</small>
      </Typography>
      <small>
        {direction === 'asc' && <>en montée</>}
        {direction === 'desc' && <>en descente</>}
        {direction === 'no-trump' && <>sans atout</>}
        {direction === 'no-trump-1' && <>sans atout #1</>}
        {direction === 'no-trump-2' && <>sans atout #2</>}
      </small>
    </Box>
  );
}
