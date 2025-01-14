import {
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { Box, Button, Table, TableBody, TableCell, TableRow, TextField } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { LoadingButton } from '@mui/lab';
import BackHandIcon from '@mui/icons-material/BackHand';
import { useNavigation } from 'react-router';

interface RegisterRoundResultsFormProps {
  defaultGameId: string;
  replayRound: () => void;
  defaultPlayersInRoundOrder: string[];
  defaultTotalCardsPerPlayer: number;
  defaultCalls: number[];
  initialResults?: number[];
}

export function RoundResultsRegistration(
  {
    defaultGameId,
    replayRound,
    defaultPlayersInRoundOrder: defaultPlayersInRoundOrderProp,
    defaultTotalCardsPerPlayer: defaultTotalCardsPerPlayerProp,
    defaultCalls: defaultCallsProp,
    initialResults,
  }: RegisterRoundResultsFormProps
) {
  const navigation = useNavigation();
  const [results, setResults] = useState(() => initialResults ?? defaultCallsProp);
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const { current: defaultCalls } = useRef(defaultCallsProp);
  const { current: defaultPlayersInRoundOrder } = useRef(defaultPlayersInRoundOrderProp);
  const { current: defaultTotalCardsPerPlayer } = useRef(defaultTotalCardsPerPlayerProp);
  const totalResults = useMemo(
    () => results.reduce((acc, result) => acc + result, 0),
    [results]
  );
  const isValidationEnabled = totalResults === defaultTotalCardsPerPlayer;
  const isSubmitting = navigation.formAction === `/games/${defaultGameId}/play`;
  const isAddButtonDisabled = (index: number) => results[index] === defaultTotalCardsPerPlayer;
  const isRemoveButtonDisabled = (index: number) => results[index] === 0;
  const getHelperText = (player: string, index: number) =>
    `${player} (${defaultCalls[index]} pli${defaultCalls[index] > 1 ? 's' : ''} demandé${defaultCalls[index] > 1 ? 's' : ''})`

  const createAddButtonClickHandler = (index: number) => () => setResults((prevResults) => {
    const newResults = [...prevResults];

    newResults[index]++;

    return newResults;
  });

  const createRemoveButtonClickHandler = (index: number) => () => setResults((prevResults) => {
    const newResults = [...prevResults];

    newResults[index]--;

    return newResults;
  });

  const getColor = (index: number): 'success' | 'warning' | undefined => {
    if (isValidationEnabled) {
      return results[index] === defaultCalls[index] ? 'success' : 'warning';
    }

    return undefined;
  }

  useEffect(() => {
    if (isValidationEnabled) {
      submitButtonRef.current?.focus();
    }
  }, [isValidationEnabled]);

  return (
    <Box width="100%" marginTop={2}>
      <Table>
        <TableBody>
          {defaultPlayersInRoundOrder.map((player, i) => (
            <TableRow key={player}>
              <TableCell>
                <Box position="relative">
                  <Box
                    position="absolute"
                    right={0}
                    top={-4}
                    gap={2}
                    zIndex={10}
                    display="flex"
                  >
                    <Button
                      variant="contained"
                      size="small"
                      type="button"
                      disabled={isRemoveButtonDisabled(i)}
                      onClick={createRemoveButtonClickHandler(i)}
                    >
                      -
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      type="button"
                      disabled={isAddButtonDisabled(i)}
                      onClick={createAddButtonClickHandler(i)}
                    >
                      +
                    </Button>
                  </Box>
                  <TextField
                    fullWidth
                    focused
                    name="result"
                    variant="standard"
                    value={results[i]}
                    label={getHelperText(player, i)}
                    color={getColor(i)}
                    slotProps={{
                      htmlInput: {
                        readOnly: true
                      }
                    }}
                  />
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Box marginTop={4} display="flex" justifyContent="space-between">
        <Button disabled={isSubmitting} startIcon={<BackHandIcon />} variant="outlined" onClick={replayRound} color="error">
          Maldonne
        </Button>
        <LoadingButton
          disabled={!isValidationEnabled}
          endIcon={<CheckIcon />}
          color="primary"
          variant="contained"
          type="submit"
          loading={isSubmitting}
          ref={submitButtonRef}
        >
          Valider
        </LoadingButton>
      </Box>
    </Box>
  );
}