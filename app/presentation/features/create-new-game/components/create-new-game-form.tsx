import { useRef, useState } from 'react';
import { Alert, Box, Button, IconButton } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Form, useNavigation } from 'react-router';
import DeleteIcon from '@mui/icons-material/DeleteForever';
import AddIcon from '@mui/icons-material/Add';
import { PlayerInput } from '~/presentation/features/create-new-game/components/player-input';
import OutlinedFlagIcon from '@mui/icons-material/OutlinedFlag';

interface PlayerEntry {
  id: number;
  defaultValue?: string;
}

const MIN_TOTAL_PLAYERS = 2;

interface CreateNewGameFormProps {
  existingPlayers: string[];
  errorMessage?: string;
  defaultPlayers?: string[];
}

export function CreateNewGameForm({ existingPlayers, errorMessage, defaultPlayers }: CreateNewGameFormProps) {
  const seqRef = useRef(0);
  const createPlayer = (defaultValue?: string): PlayerEntry => ({ id: seqRef.current++, defaultValue });
  const [players, setPlayers] = useState((): PlayerEntry[] => defaultPlayers?.map(createPlayer) ?? Array.from({ length: MIN_TOTAL_PLAYERS }, createPlayer));
  const navigation = useNavigation();
  const isRemovalImpossible = players.length <= MIN_TOTAL_PLAYERS;
  const addNewPlayer = () => setPlayers((prevPlayers) => [...prevPlayers, createPlayer()]);
  const removePlayer = (playerToRemove: PlayerEntry) => setPlayers((prevPlayers) => prevPlayers.filter((player) => player !== playerToRemove));

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <Box component={Form} method="post" position="relative">
        <Box fontSize={36} fontWeight="bold" marginY={4}>
          Nouvelle partie
        </Box>
        <Box display="flex" flexDirection="column" gap={3} className='flex flex-col gap-4'>
          {players.map((player, i) => (
            <Box key={player.id} display="flex" alignItems="center" gap={2}>
              <div>
                <PlayerInput defaultPlayer={player.defaultValue} existingPlayers={existingPlayers} index={i + 1}/>
              </div>
              <div>
                <IconButton
                  disabled={isRemovalImpossible}
                  type="button"
                  onClick={() => removePlayer(player)}
                  sx={{ opacity: isRemovalImpossible ? '0.3' : undefined}}
                >
                  <DeleteIcon color="error"/>
                </IconButton>
              </div>
            </Box>
          ))}
        </Box>
        <Box marginTop={2}>
          <IconButton type="button" onClick={addNewPlayer}>
            <AddIcon/>
          </IconButton>
        </Box>
        <Box marginTop={4} display="flex" alignItems="center" position="absolute" width="max-content" gap={3} height={50}>
          <div>
            <LoadingButton
              loading={navigation.state !== 'idle'}
              loadingPosition="start"
              type="submit"
              variant="contained"
              startIcon={<OutlinedFlagIcon />
            }>
              C'est parti !
            </LoadingButton>
          </div>
          {errorMessage && navigation.state !== 'submitting' ? (
            <Box position="absolute" top={0} left={90} display="flex" alignItems="center">
              <Alert variant="filled" severity="error">
                {errorMessage}
              </Alert>
            </Box>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
}
