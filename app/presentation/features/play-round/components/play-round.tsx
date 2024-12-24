import type { RoundInfo } from '~/domain/entities/round-info';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import type { Ranking } from '~/domain/entities/ranking';
import { Form, Link, useNavigation } from 'react-router';
import { useState, type FormEventHandler, useMemo, useRef, useEffect } from 'react';
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import BackHandIcon from '@mui/icons-material/BackHand';
import ExitToAppIcon from '@mui/icons-material/Logout';
import UndoIcon from '@mui/icons-material/Undo';
import OutlinedFlagIcon from '@mui/icons-material/OutlinedFlag';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { LoadingButton } from '@mui/lab';

interface PlayRoundProps {
  round: RoundInfo;
  totalRounds: number;
  ranking: Ranking;
  replayRound: () => void;
  roundId: string;
  gameId: string;
}

interface StoredValues {
  step: 'call' | 'result';
  calls: number[];
  results: number[];
  resetResultIndex: number | null;
  isResettingPreviousCall: boolean;
  error: string | null;
  roundId: string;
}

export function PlayRound({ round, totalRounds, ranking, replayRound, roundId, gameId }: PlayRoundProps ) {
  let {
    playersInRoundOrder,
    direction,
    dealer,
    index,
    totalCardsPerPlayer,
  } = round;
  const remainingRounds = totalRounds - index + 1;
  const isLastRound = index === totalRounds;
  const [initialValues] = useState(() => {
    const storedRound = localStorage.getItem(gameId);
    const storedValues = storedRound ? JSON.parse(storedRound) as StoredValues : null;

    return storedValues?.roundId === roundId ? storedValues : null;
  });
  const [step, setStep] = useState<'call' | 'result'>(initialValues?.step ?? 'call');
  const [calls, setCalls] = useState<number[]>(initialValues?.calls ?? []);
  const [results, setResults] = useState<number[]>(initialValues?.results ?? []);
  const [isResettingPreviousCall, setIsResettingPreviousCall] = useState(initialValues?.isResettingPreviousCall ?? false);
  const [resetResultIndex, setResetResultIndex] = useState<null | number>(initialValues?.resetResultIndex ?? null);
  const [isExitConfirmDialogOpen, setIsExitConfirmDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(initialValues?.error ?? null);
  const currentInputRef = useRef<HTMLInputElement>(null);
  const navigation = useNavigation();
  const hasError = !!error;
  const currentCallIndex = isResettingPreviousCall ? calls.length - 1 : calls.length;
  const currentResultIndex = resetResultIndex !== null ? resetResultIndex : results.length;
  const totalCalls = useMemo(
    () => calls.slice(0, currentCallIndex).reduce((acc, call) => acc + call, 0),
    [currentCallIndex, calls]
  );
  const totalResults = useMemo(
    () => results.slice(0, currentResultIndex).reduce((acc, result) => acc + result, 0),
    [currentResultIndex, results]
  );
  const resetPreviousCall = () => {
    setIsResettingPreviousCall(true);
    setError(null);
  }

  const resetResult = (resultIndex: number) => {
    setResetResultIndex(resultIndex);
    setError(null);
  }

  const validateCall = (call: number) => {
    const newCalls = [...calls];

    newCalls[currentCallIndex] = call;

    setIsResettingPreviousCall(false);
    setCalls(newCalls);
    setError(null);
  }

  const validateResult = (result: number) => {
    const newResults = [...results];

    newResults[currentResultIndex] = result;

    setResetResultIndex(null);
    setResults(newResults);
    setError(null);
  }

  const hasResetCallButton = (callIndex: number) => {
    return step === 'call' && !isResettingPreviousCall && callIndex === calls.length - 1;
  }

  const hasResetResultButton = (resultIndex: number) => {
    return step === 'result' && resultIndex < currentResultIndex && resetResultIndex === null;
  }

  const isLastCall = currentCallIndex === playersInRoundOrder.length - 1;
  const isLastResult = currentResultIndex === playersInRoundOrder.length - 1;
  const forbiddenLastCall = isLastCall && totalCalls <= totalCardsPerPlayer
    ? totalCardsPerPlayer - totalCalls
    : null;
  const mandatoryLastResult = useMemo(() => {
    if (isLastResult) {
      return totalCardsPerPlayer - totalResults;
    }

    return resetResultIndex === null && totalResults === totalCardsPerPlayer
      ? 0
      : null;
  }, [results, isLastResult, resetResultIndex, totalCardsPerPlayer]);

  const getCallHelperText = (callIndex: number): string | undefined => {
    if ((callIndex === 0 && !hasError) || callIndex !== currentCallIndex) {
      return undefined;
    }

    if (error) {
      return error;
    }

    if (isLastCall) {
      return forbiddenLastCall === null ? 'Tu peux dire ce que tu veux !' :  `Pas ${totalCardsPerPlayer - totalCalls}`;
    }

    return `${totalCalls} pli${totalCalls > 1 ? 's' : ''} demandé${totalCalls > 1 ? 's' : ''} sur ${totalCardsPerPlayer} possible${totalCardsPerPlayer > 1 ? 's' : ''} pour le moment`
  }

  const getResultHelperText = (resultIndex: number): string | undefined => {
    if (resultIndex === currentResultIndex && error !== null) {
      return error;
    }

    if (resetResultIndex === null && resultIndex === results.length && mandatoryLastResult !== null) {
      return `Devrait être ${mandatoryLastResult} en toute logique`
    }

    return undefined;
  }

  const handleFormSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    if (step === 'call') {
      e.preventDefault();

      if (calls.length === playersInRoundOrder.length) {
        setStep('result');
      } else {
        const formData = new FormData(e.currentTarget);
        const stringCalls = formData.getAll('call') as string[];
        const stringCall = stringCalls[stringCalls.length - 1];

        if (stringCall) {
          const call = Number(stringCall);

          if (isNaN(call) || call < 0 || call > totalCardsPerPlayer || (forbiddenLastCall !== null && call === forbiddenLastCall)) {
            setError(`Doit être un nombre compris entre 0 et ${totalCardsPerPlayer}${forbiddenLastCall !== null ? ` et différent de ${forbiddenLastCall}` : ''}`);
          } else {
            validateCall(call);
          }
        }
      }
    } else if (results.length !== playersInRoundOrder.length) {
      e.preventDefault();

      const formData = new FormData(e.currentTarget);
      const stringResults = formData.getAll('result') as string[];
      const stringResult = stringResults[resetResultIndex !== null ? resetResultIndex : stringResults.length - 1];

      if (stringResult) {
        const result = Number(stringResult);
        const limit = resetResultIndex === null
          ? totalCardsPerPlayer - totalResults
          : totalCardsPerPlayer - results.slice(0, resetResultIndex).reduce((acc, result ) => acc + result, 0);

        if (isNaN(result) || (mandatoryLastResult !== null && result !== mandatoryLastResult) || result < 0 || result > limit) {
          setError(mandatoryLastResult !== null ? `Ne peut être que ${mandatoryLastResult}` : `Doit être un nombre compris entre 0 et ${limit}`);
        } else if (resetResultIndex !== null) {
          let newResults = [...results];
          newResults[resetResultIndex] = result;
          let total = newResults.slice(0, resetResultIndex + 1).reduce((acc, result ) => acc + result, 0);
          let i = resetResultIndex + 1;

          while (total + newResults[i] <= totalCardsPerPlayer) {
            total += newResults[i];
            i += 1;
          }

          newResults = newResults.slice(0, i);
          setResults(newResults);
          setError(null);
          setResetResultIndex(null);
        } else {
          validateResult(result);
        }
      }
    }
  }

  const handleReplayRoundClick = () => {
    localStorage.removeItem(gameId);
    replayRound();
  }

  useEffect(() => {
    if (isResettingPreviousCall) {
      currentInputRef.current?.focus();
      currentInputRef.current?.select();
    }
  }, [isResettingPreviousCall]);

  useEffect(() => {
    if (step === 'result') {
      const { current: inputElement } = currentInputRef;

      if (!inputElement) {
        return;
      }

      if (mandatoryLastResult !== null) {
        inputElement.value = String(mandatoryLastResult);
      }

      inputElement.select();
    }
  }, [currentResultIndex, step, mandatoryLastResult]);

  useEffect(() => {
    const storedValues: StoredValues = {
      step,
      calls,
      results,
      resetResultIndex,
      isResettingPreviousCall,
      error,
      roundId
    };

    localStorage.setItem(gameId, JSON.stringify(storedValues));
  }, [calls, results, step, roundId, isResettingPreviousCall, resetResultIndex, error]);

  return (
    <>
      <Box position="fixed" right={16} top={16} display="flex" gap={2} alignItems="center" justifyContent="right">
        <Button startIcon={<BackHandIcon />} variant="outlined" onClick={handleReplayRoundClick} color="error" disabled={calls.length === 0}>
          Maldonne, rejouer le tour
        </Button>
        <Button startIcon={<ExitToAppIcon />} variant="outlined" color="primary" onClick={() => setIsExitConfirmDialogOpen(true)}>
          Abandonner la partie
        </Button>
      </Box>

      <Box display="flex" width="100%" gap={4} justifyContent="space-between">

        <Box borderRight={(theme) => `solid 1px ${theme.palette.divider}`} minWidth="max-content" paddingX={2} paddingTop={1} height="100vh">
          <Typography variant="h1">
            {isLastRound ? 'Dernier tour' : (
              <>
                {index}<sup>{index === 1 ? 'er' : 'ème'}</sup> tour
              </>
            )}
          </Typography>
          <Box>
            <ul>
              <li>
                <strong>{dealer}</strong> distribue <strong>{totalCardsPerPlayer}</strong> carte{totalCardsPerPlayer > 1 ? 's' : ''}
              </li>
              <li>
                <strong>
                  {direction === 'asc' && 'En montée'}
                  {direction === 'desc' && 'En descente'}
                  {direction === 'no-trump' && 'Sans atout'}
                  {direction === 'no-trump-1' && <>1<sup>er</sup> tour de sans atout</>}
                  {direction === 'no-trump-2' && <>2<sup>ème</sup> tour de sans atout</>}
                </strong>
                {!isLastRound && (
                  <>
                    ,&nbsp;
                    <strong>
                      {remainingRounds}
                    </strong>
                    &nbsp;tours restants
                  </>
                )}
              </li>
            </ul>
          </Box>

          {index !== 1 && (
            <Box paddingTop={6}>
              <Typography variant="h2">
                Classement provisoire :
              </Typography>

              <ul>
                {ranking.map(({player, index, isExAequoWithPrevious, cumulativePoints}, i) => (
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
                  to="/scores"
                  startIcon={<SportsScoreIcon />}
                  loadingPosition="start"
                  loading={navigation.state === 'loading' && navigation.location.pathname === '/scores'}
                >
                  Scores détaillés
                </LoadingButton>
              </Box>
            </Box>
          )}
        </Box>

        <Box width="100%" paddingTop={6} paddingBottom={2} paddingRight={2}>
          <Form method="post" onSubmit={handleFormSubmit} autoComplete="off">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width="40%">
                    <strong>Plis demandés</strong>
                  </TableCell>
                  <TableCell width="40%">
                    <strong>Plis obtenus</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {playersInRoundOrder.map((player, i) => (
                  <TableRow key={player} style={{ height: 80 }}>
                    <TableCell padding="none">
                      <input type="hidden" name="player" value={player}/>
                      {i <= currentCallIndex ? (
                        <Box display="flex" flexDirection="row">
                          <Box width={400} paddingRight={2}>
                            <TextField
                              autoFocus
                              autoComplete="off"
                              variant="standard"
                              label={player}
                              defaultValue={calls[i]}
                              helperText={getCallHelperText(i)}
                              type="number"
                              name="call"
                              fullWidth
                              inputRef={i === currentCallIndex ? currentInputRef : undefined}
                              error={i === currentCallIndex && hasError}
                              slotProps={i < currentCallIndex ? {htmlInput: {readOnly: true}} : undefined}
                            />
                          </Box>
                          {hasResetCallButton(i) && (
                            <Box marginLeft={4}>
                              <Button startIcon={<UndoIcon />} variant="outlined" size="small" type="button"
                                      onClick={resetPreviousCall}>Corriger</Button>
                            </Box>
                          )}
                        </Box>
                      ) : <Box fontStyle="italic">{player}</Box>}
                    </TableCell>
                    <TableCell padding="none">
                      <Box display="flex" flexDirection="row">
                        {step === 'result' && (i <= results.length) ? (
                          <Box width={250} paddingRight={2}>
                            <TextField
                              autoFocus
                              autoComplete="off"
                              variant="standard"
                              label={player}
                              helperText={getResultHelperText(i)}
                              type="number"
                              name="result"
                              fullWidth
                              defaultValue={calls[i]}
                              inputRef={i === currentResultIndex ? currentInputRef : undefined}
                              error={i === currentResultIndex && hasError}
                              slotProps={(resetResultIndex !== null && resetResultIndex !== i) || (resetResultIndex === null && i < currentResultIndex) ? { htmlInput: { readOnly: true } } : undefined}
                            />
                          </Box>
                        ) : '-'}
                        {i < results.length && (resetResultIndex === null || resetResultIndex !== i) && (
                          <Box display="flex" justifyContent="space-between" alignItems="center" flex={1}>
                            {(resetResultIndex === null || i !== resetResultIndex) && (
                              <>
                                {calls[i] === results[i] ? (
                                  <Alert variant="filled" severity="success">C'est bon !</Alert>
                                ) : (
                                  <Alert variant="filled" severity="warning">{Math.abs(calls[i] - results[i])} de {calls[i] > results[i] ? 'moins' : 'trop'} !</Alert>
                                )}
                              </>
                            )}
                            {hasResetResultButton(i) && (
                              <Box marginLeft={4}>
                                <Button startIcon={<UndoIcon />} variant="outlined" size="small" type="button" onClick={() => resetResult(i)}>Corriger</Button>
                              </Box>
                            )}
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {step === 'call' ? (
              <Box marginTop={2} display={calls.length !== playersInRoundOrder.length ? 'none' : undefined}>
                <Button type="submit" variant="outlined" startIcon={<OutlinedFlagIcon />}>
                  C'est parti !
                </Button>
              </Box>
            ) : (
              <Box marginTop={2} display="flex" justifyContent="space-between">
                <Box width="max-content">
                  <Alert variant="filled" severity="info">
                    {totalCalls > totalCardsPerPlayer ? <><strong>ON SE BAT</strong> de <strong>{totalCalls - totalCardsPerPlayer}</strong></> : <>
                      <strong>ON NE SE BAT PAS</strong> de <strong>{totalCardsPerPlayer - totalCalls}</strong></>} !
                  </Alert>
                </Box>
                <Box display={results.length !== playersInRoundOrder.length ? 'none' : undefined}>
                  <LoadingButton
                    type="submit"
                    variant="outlined"
                    endIcon={<ArrowForwardIosIcon />}
                    loading={navigation.state !== 'idle' && navigation.location.pathname === '/'}
                    loadingPosition="end"
                  >
                    {index === totalRounds ? 'Fin de la partie' : 'Tour suivant'}
                  </LoadingButton>
                </Box>
              </Box>
            )}
          </Form>

          <Dialog
            open={isExitConfirmDialogOpen}
            onClose={() => setIsExitConfirmDialogOpen(false)}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                Es-tu sûr(e) de vouloir abandonner la partie ?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Form action="/exit" method="post">
                <Box display="flex" gap={2}>
                  <Button variant="outlined" type="button" onClick={() => setIsExitConfirmDialogOpen(false)}>Non, continuer la partie</Button>
                  <LoadingButton
                    color="error"
                    variant="outlined"
                    type="submit"
                    loadingPosition="center"
                    loading={(navigation.state === 'submitting' && navigation.location.pathname === '/exit') || (navigation.state === 'loading' && navigation.location.pathname === '/new')}
                  >
                    Oui, abandonner la partie
                  </LoadingButton>
                </Box>
              </Form>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </>
  );
}

