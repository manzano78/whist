import { Box, Button, Table, TableBody, TableCell, TableRow, TextField } from '@mui/material';
import {
  type ChangeEvent,
  type KeyboardEventHandler,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import {
  forceNumber
} from '~/presentation/utils/input-utils';
import OutlinedFlagIcon from '@mui/icons-material/OutlinedFlag';
import UndoIcon from '@mui/icons-material/Undo';

interface State {
  values: { [player: string]: number };
  index: number;
  isFixingPreviousCall: boolean;
  isFixingPreviousCallDefinitelyForbidden: boolean;
  isInError: boolean;
}

export interface RoundCallRegistrationProps {
  inputName?: string;
  defaultPlayersInOrder: string[];
  defaultTotalCardsPerPlayer: number;
  initialState?: State;
  onChange?: (state: State) => void;
  onComplete?: () => void;
}

const defaultState: State = {
  values: {},
  index: 0,
  isFixingPreviousCall: false,
  isFixingPreviousCallDefinitelyForbidden: false,
  isInError: false,
}

interface RoundCallsRegistrationState {
  index: number;
  submittedCallsSum: number;
  lastFixableCall: number | null;
  isInError: boolean;
}

interface InitialRoundCallsRegistrationState extends RoundCallsRegistrationState {
  defaultValues: { [player: string]: string };
}

const defState: RoundCallsRegistrationState = {
  index: 0,
  submittedCallsSum: 0,
  lastFixableCall: null,
  isInError: false,
}

function Test(
  {
    defaultPlayersInOrder: defaultPlayersInOrderProp,
    defaultTotalCardsPerPlayer: defaultTotalCardsPerPlayerProp,
    initialState,
  }: {
    defaultPlayersInOrder: string[];
    defaultTotalCardsPerPlayer: number;
    initialState?: InitialRoundCallsRegistrationState;
  }
) {
  const [
    {
      index,
      submittedCallsSum,
      lastFixableCall,
      isInError,
    },
    setState
  ] = useState<RoundCallsRegistrationState>(() => initialState ? ({
    index: initialState.index,
    isInError: initialState.isInError,
    lastFixableCall: initialState.lastFixableCall,
    submittedCallsSum: initialState.submittedCallsSum,
  }) : defState);
  const { current: defaultPlayersInOrder } = useRef(defaultPlayersInOrderProp);
  const { current: defaultTotalCardsPerPlayer } = useRef(defaultTotalCardsPerPlayerProp);
  const { current: defaultValues = {} } = useRef(initialState?.defaultValues);
  const currentPlayer = defaultPlayersInOrder[index];
  const isLastCall = index === defaultPlayersInOrder.length - 1;
  const isToValidate = index === defaultPlayersInOrder.length;
  const forbiddenLastCall = isLastCall && submittedCallsSum <= defaultTotalCardsPerPlayer ? defaultTotalCardsPerPlayer - submittedCallsSum : null;
  const mandatoryLastCall = isLastCall && defaultTotalCardsPerPlayer === 1 && submittedCallsSum < 2 ? submittedCallsSum : null;

  const getCallValue = (player: string): string | number => {
    const callValue = values[player];

    if (player !== currentPlayer) {
      return callValue ?? '';
    }

    return callValue ?? mandatoryLastCall ?? '';
  };

  const shouldShowFixPreviousCallButton = (callIndex: number) =>
    callIndex === index - 1 && !isFixingPreviousCall && !isFixingPreviousCallDefinitelyForbidden;

  const fixPreviousCall = () => {
    const newState: State = {
      values,
      isFixingPreviousCallDefinitelyForbidden,
      index: index - 1,
      isFixingPreviousCall: true,
      isInError: false,
    };

    setState(newState);
    onChange?.(newState);
  };

  const setIsInError = (isInError: boolean) => {
    const newState: State = {
      values,
      index,
      isFixingPreviousCall,
      isFixingPreviousCallDefinitelyForbidden,
      isInError,
    };

    setState(newState);
    onChange?.(newState);
  };

  const getCallInputHelperText = (callIndex: number): string | undefined => {
    if (callIndex !== index) {
      return undefined;
    }

    if (mandatoryLastCall !== null) {
      return `${mandatoryLastCall} obligatoire`;
    }

    if (isInError) {
      if (defaultTotalCardsPerPlayer === forbiddenLastCall) {
        const max = defaultTotalCardsPerPlayer - 1;

        return max === 0 ? 'Ne peut-être que 0' : `Doit être un nombre compris entre 0 et ${max}`;
      }

      if (forbiddenLastCall !== null) {
        return `Doit être un nombre compris entre 0 et ${defaultTotalCardsPerPlayer} et différent de ${forbiddenLastCall}`;
      }

      return `Doit être un nombre compris entre 0 et ${defaultTotalCardsPerPlayer}`;
    }

    if (isLastCall) {
      return forbiddenLastCall === null ? 'Tu peux dire ce que tu veux !' :  `Pas ${forbiddenLastCall}`;
    }

    if (callIndex === 0) {
      return undefined;
    }

    return `${submittedCallsSum} pli${submittedCallsSum > 1 ? 's' : ''} demandé${submittedCallsSum > 1 ? 's' : ''} sur ${defaultTotalCardsPerPlayer} possible${defaultTotalCardsPerPlayer > 1 ? 's' : ''} pour le moment`
  };

  const submitPlayerCall = () => {
    const call = values[currentPlayer];

    if (call > defaultTotalCardsPerPlayer || call === forbiddenLastCall) {
      setIsInError(true);
    } else {
      const newState: State = {
        isInError: false,
        isFixingPreviousCall: false,
        index: index + 1,
        isFixingPreviousCallDefinitelyForbidden: isLastCall && mandatoryLastCall !== null,
        values: mandatoryLastCall !== null ? {
          ...values,
          [currentPlayer]: mandatoryLastCall,
        } : values,
      }

      setState(newState);
      onChange?.(newState);
    }
  };

  const handleCallChange = (e: ChangeEvent<HTMLInputElement>) => {
    const call = forceNumber(e.currentTarget.value);
    const newValues = { ...values };

    if (call) {
      newValues[currentPlayer] = Number(call);
    } else {
      delete newValues[currentPlayer];
    }

    const newState: State = {
      isFixingPreviousCall,
      isFixingPreviousCallDefinitelyForbidden,
      index,
      isInError,
      values: newValues
    }

    setState(newState);
    onChange?.(newState);
  };

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key === "Enter" && event.currentTarget.value !== '') {
      event.preventDefault();
      submitPlayerCall();
    }
  };

  const handleComplete = () => {
    const newState: State = {
      values,
      index: index + 1,
      isFixingPreviousCall,
      isFixingPreviousCallDefinitelyForbidden,
      isInError,
    };
    setState(newState);
    onChange?.(newState);
    onComplete?.();
  };

  useEffect(() => {
    currentInputRef.current?.focus();

    if (isFixingPreviousCall) {
      currentInputRef.current?.select();
    }
  }, [index, isFixingPreviousCall]);

  return (
    <Box>
      <Box>
        <Table>
          <TableBody>
            {defaultPlayersInOrder.map((player, i) => (
              <TableRow key={player}>
                <TableCell>
                  <Box width={400} position="relative">
                    {shouldShowFixPreviousCallButton(i) && (
                      <Box position="absolute" right={0} top={8} zIndex={10}>
                        <Button startIcon={<UndoIcon />} variant="outlined" size="small" type="button"
                                onClick={fixPreviousCall}>Corriger</Button>
                      </Box>
                    )}
                    <TextField
                      fullWidth
                      autoFocus
                      autoComplete="off"
                      variant="standard"
                      label={player}
                      helperText={getCallInputHelperText(i)}
                      type="text"
                      name="call"
                      error={isInError && i === index}
                      slotProps={{
                        htmlInput: {
                          onKeyDown: handleKeyDown,
                          readOnly: i < index
                        }
                      }}
                      inputRef={i === index ? currentInputRef : undefined}
                    />
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
      {isToValidate && (
        <Box marginTop={2}>
          <Button onClick={handleComplete} autoFocus type="button" variant="outlined" startIcon={<OutlinedFlagIcon />}>
            C'est parti !
          </Button>
        </Box>
      )}
    </Box>
  );
}

export function RoundCallsRegistration(
  {
    onComplete,
    defaultPlayersInOrder: defaultPlayersInOrderProp,
    defaultTotalCardsPerPlayer: defaultTotalCardsPerPlayerProp,
    inputName = 'call',
    initialState = defaultState,
    onChange,
  }: RoundCallRegistrationProps
) {
  return function RoundCallsRegistration({ compact = false }: { compact?: boolean}) {
    const [{
      values,
      index,
      isFixingPreviousCall,
      isInError,
      isFixingPreviousCallDefinitelyForbidden,
    }, setState] = useState(initialState);
    const currentInputRef = useRef<HTMLInputElement>(null);
    const submittedCallsSum = useMemo(() => Object.values(values).reduce((acc, call, i) => acc + (i < index ? call : 0), 0), [values, index]);
    const currentPlayer = defaultPlayersInOrder[index];
    const isLastCall = index === defaultPlayersInOrder.length - 1;
    const isToValidate = index === defaultPlayersInOrder.length;
    const forbiddenLastCall = isLastCall && submittedCallsSum <= defaultTotalCardsPerPlayer ? defaultTotalCardsPerPlayer - submittedCallsSum : null;
    const mandatoryLastCall = isLastCall && defaultTotalCardsPerPlayer === 1 && submittedCallsSum < 2 ? submittedCallsSum : null;

    const getCallValue = (player: string): string | number => {
      const callValue = values[player];

      if (player !== currentPlayer) {
        return callValue ?? '';
      }

      return callValue ?? mandatoryLastCall ?? '';
    };

    const shouldShowFixPreviousCallButton = (callIndex: number) =>
      callIndex === index - 1 && !isFixingPreviousCall && !isFixingPreviousCallDefinitelyForbidden;

    const fixPreviousCall = () => {
      const newState: State = {
        values,
        isFixingPreviousCallDefinitelyForbidden,
        index: index - 1,
        isFixingPreviousCall: true,
        isInError: false,
      };

      setState(newState);
      onChange?.(newState);
    };

    const setIsInError = (isInError: boolean) => {
      const newState: State = {
        values,
        index,
        isFixingPreviousCall,
        isFixingPreviousCallDefinitelyForbidden,
        isInError,
      };

      setState(newState);
      onChange?.(newState);
    };

    const getCallInputHelperText = (callIndex: number): string | undefined => {
      if (callIndex !== index) {
        return undefined;
      }

      if (mandatoryLastCall !== null) {
        return `${mandatoryLastCall} obligatoire`;
      }

      if (isInError) {
        if (defaultTotalCardsPerPlayer === forbiddenLastCall) {
          const max = defaultTotalCardsPerPlayer - 1;

          return max === 0 ? 'Ne peut-être que 0' : `Doit être un nombre compris entre 0 et ${max}`;
        }

        if (forbiddenLastCall !== null) {
          return `Doit être un nombre compris entre 0 et ${defaultTotalCardsPerPlayer} et différent de ${forbiddenLastCall}`;
        }

        return `Doit être un nombre compris entre 0 et ${defaultTotalCardsPerPlayer}`;
      }

      if (isLastCall) {
        return forbiddenLastCall === null ? 'Tu peux dire ce que tu veux !' :  `Pas ${forbiddenLastCall}`;
      }

      if (callIndex === 0) {
        return undefined;
      }

      return `${submittedCallsSum} pli${submittedCallsSum > 1 ? 's' : ''} demandé${submittedCallsSum > 1 ? 's' : ''} sur ${defaultTotalCardsPerPlayer} possible${defaultTotalCardsPerPlayer > 1 ? 's' : ''} pour le moment`
    };

    const submitPlayerCall = () => {
      const call = values[currentPlayer];

      if (call > defaultTotalCardsPerPlayer || call === forbiddenLastCall) {
        setIsInError(true);
      } else {
        const newState: State = {
          isInError: false,
          isFixingPreviousCall: false,
          index: index + 1,
          isFixingPreviousCallDefinitelyForbidden: isLastCall && mandatoryLastCall !== null,
          values: mandatoryLastCall !== null ? {
            ...values,
            [currentPlayer]: mandatoryLastCall,
          } : values,
        }

        setState(newState);
        onChange?.(newState);
      }
    };

    const handleCallChange = (e: ChangeEvent<HTMLInputElement>) => {
      const call = forceNumber(e.currentTarget.value);
      const newValues = { ...values };

      if (call) {
        newValues[currentPlayer] = Number(call);
      } else {
        delete newValues[currentPlayer];
      }

      const newState: State = {
        isFixingPreviousCall,
        isFixingPreviousCallDefinitelyForbidden,
        index,
        isInError,
        values: newValues
      }

      setState(newState);
      onChange?.(newState);
    };

    const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
      if (event.key === "Enter" && event.currentTarget.value !== '') {
        event.preventDefault();
        submitPlayerCall();
      }
    };

    const handleComplete = () => {
      const newState: State = {
        values,
        index: index + 1,
        isFixingPreviousCall,
        isFixingPreviousCallDefinitelyForbidden,
        isInError,
      };
      setState(newState);
      onChange?.(newState);
      onComplete?.();
    };

    useEffect(() => {
      currentInputRef.current?.focus();

      if (isFixingPreviousCall) {
        currentInputRef.current?.select();
      }
    }, [index, isFixingPreviousCall]);

    return (
      <Box>
        <Box>
          <Table>
            <TableBody>
              {defaultPlayersInOrder.map((player, i) => (
                <TableRow key={player}>
                  <TableCell>
                    <Box width={400} position="relative">
                      {shouldShowFixPreviousCallButton(i) && (
                        <Box position="absolute" right={0} top={8} zIndex={10}>
                          <Button startIcon={<UndoIcon />} variant="outlined" size="small" type="button"
                                  onClick={fixPreviousCall}>Corriger</Button>
                        </Box>
                      )}
                      <TextField
                        fullWidth
                        autoFocus
                        autoComplete="off"
                        variant="standard"
                        label={player}
                        value={getCallValue(player)}
                        onChange={handleCallChange}
                        helperText={getCallInputHelperText(i)}
                        type="text"
                        name="call"
                        error={isInError && i === index}
                        slotProps={{
                          htmlInput: {
                            onKeyDown: handleKeyDown,
                            readOnly: i < index
                          }
                        }}
                        inputRef={i === index ? currentInputRef : undefined}
                      />
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
        {isToValidate && (
          <Box marginTop={2}>
            <Button onClick={handleComplete} autoFocus type="button" variant="outlined" startIcon={<OutlinedFlagIcon />}>
              C'est parti !
            </Button>
          </Box>
        )}
      </Box>
    );
  }
}
