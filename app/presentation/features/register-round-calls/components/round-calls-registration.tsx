import { Box, Button, Table, TableBody, TableCell, TableRow, TextField } from '@mui/material';
import {
  type ChangeEventHandler,
  type KeyboardEventHandler, type RefObject, use,
  useEffect, useMemo,
  useRef,
  useState
} from 'react';
import OutlinedFlagIcon from '@mui/icons-material/OutlinedFlag';
import UndoIcon from '@mui/icons-material/Undo';
import { UncontrolledNumberInputField } from '~/presentation/infrastructure/uncontrolled-number-input-field';
import { IsMobileContext } from '~/presentation/contexts/is-mobile-context';
import CheckIcon from '@mui/icons-material/Check';
import type { RoundInfo } from '~/domain/entities/round-info';
import BackHandIcon from '@mui/icons-material/BackHand';

interface RoundCallsRegistrationState {
  index: number;
  calls: number[];
  isFixing: boolean;
  isInError: boolean;
  isCallDirty: boolean;
}

export interface InitialRoundCallsRegistrationState {
  calls: number[];
  draft?: {
    index: number;
    isFixing: boolean;
    isInError: boolean;
  }
}

interface RoundCallsRegistrationProps {
  defaultRoundInfo: RoundInfo;
  replayRound: () => void;
  initialState?: InitialRoundCallsRegistrationState;
  onComplete?: (calls: number[]) => void;
}

const defaultState: RoundCallsRegistrationState = {
  index: 0,
  calls: [],
  isFixing: false,
  isInError: false,
  isCallDirty: false,
};

export function RoundCallsRegistration(
  {
    defaultRoundInfo: defaultRoundInfoProp,
    initialState,
    onComplete,
    replayRound,
  }: RoundCallsRegistrationProps
) {
  const [
    {
      index,
      isFixing,
      calls,
      isInError,
      isCallDirty,
    },
    setState
  ] = useState<RoundCallsRegistrationState>(() => {
    if (initialState) {
      const {
        calls,
        draft
      } = initialState;

      if (draft) {
        return {
          calls,
          isCallDirty: typeof calls[draft.index] === 'number',
          ...draft,
        };
      }

      return {
        calls,
        index: defaultRoundInfoProp.playersInRoundOrder.length + 1,
        isCallDirty: false,
        isInError: false,
        isFixing: false,
      };
    }

    return defaultState;
  });
  const isMobile = use(IsMobileContext);
  const {
    current: {
      playersInRoundOrder: defaultPlayersInOrder,
      totalCardsPerPlayer: defaultTotalCardsPerPlayer,
    }
  } = useRef(defaultRoundInfoProp);
  const startButtonRef = useRef<HTMLButtonElement>(null);
  const currentInputRef = useRef<HTMLInputElement>(null);
  const submittedCallsSum = useMemo(
    () => calls.slice(0, index).reduce((acc, call) => acc + call, 0),
    [calls, index]
  );
  const isLastCall = index === defaultPlayersInOrder.length - 1;
  const isToValidate = index === defaultPlayersInOrder.length;
  const isComplete = index === defaultPlayersInOrder.length + 1;
  const forbiddenLastCall = isLastCall && submittedCallsSum <= defaultTotalCardsPerPlayer ? defaultTotalCardsPerPlayer - submittedCallsSum : null;
  const mandatoryLastCall = useMemo(() => {
    if (defaultTotalCardsPerPlayer !== 1 || (!isLastCall && !isToValidate && !isComplete)) {
      return null;
    }

    const totalCallsBeforeLastOne =  calls.slice(0, defaultPlayersInOrder.length - 1).reduce((acc, call) => acc + call, 0);

    return totalCallsBeforeLastOne < 2 ? totalCallsBeforeLastOne : null;
  }, [
    isLastCall,
    isToValidate,
    isComplete,
    defaultTotalCardsPerPlayer,
    defaultPlayersInOrder,
    calls,
  ]);

  const fixPreviousCall = () => {
    setState((prevState) => ({
      ...prevState,
      isFixing: true,
      isInError: false,
      isCallDirty: true,
      index: prevState.index - 1,
    }));
  };

  const submitInput = (rawCall: string) => {
    if (!rawCall) {
      return;
    }

    const call = Number(rawCall);

    if (call > defaultTotalCardsPerPlayer || call === forbiddenLastCall) {
      setState((prevState) => ({
        ...prevState,
        isInError: true,
      }));
    } else {
      setState((prevState) => {
        const nextCalls = [...prevState.calls];

        nextCalls[prevState.index] = call;

        return {
          isCallDirty: false,
          calls: nextCalls,
          index: prevState.index + 1,
          isInError: false,
          isFixing: false,
        }
      });
    }
  };

  const handleCallChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const isCallDirty = event.currentTarget.value !== '';

    setState((prevState) => prevState.isCallDirty === isCallDirty ? prevState : {
      ...prevState,
      isCallDirty,
    });
  };

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      submitInput(event.currentTarget.value);
    }
  };

  const handleValidateCall = () => {
    const { current: currentInputElement } = currentInputRef;

    if (currentInputElement) {
      submitInput(currentInputElement.value);
    }
  };

  const handleComplete = () => {
    setState((prevState) => ({
      ...prevState,
      index: prevState.index + 1,
    }));
    onComplete?.(calls);
  };

  const isDisplayButtonDisabled = index === 0 && !isCallDirty;

  const shouldShowFixPreviousCallButton = (callIndex: number) =>
    callIndex === index - 1 && !isFixing && (index < defaultPlayersInOrder.length || mandatoryLastCall === null);

  const shouldShowCallValidationButton = (callIndex: number) =>
    callIndex === index && isCallDirty && isMobile;

  const getInputHelperText = (inputIndex: number): string | undefined => {
    if (inputIndex !== index) {
      return undefined;
    }

    if (isInError) {
      if (defaultTotalCardsPerPlayer === forbiddenLastCall) {
        const max = defaultTotalCardsPerPlayer - 1;

        return max === 0 ? 'Ne peut-être que 0' : `Doit être inférieur ou égal à ${max}`;
      }

      if (forbiddenLastCall !== null) {
        return `Doit être inférieur ou égal à ${defaultTotalCardsPerPlayer} et différent de ${forbiddenLastCall}`;
      }

      return `Doit être inférieur ou égal à ${defaultTotalCardsPerPlayer}`;
    }

    if (inputIndex === 0) {
      return undefined;
    }

    let prefix: string;
    let suffix = '';

    if (submittedCallsSum === defaultTotalCardsPerPlayer) {
      prefix = 'Quota atteint !';
    } else if (submittedCallsSum > defaultTotalCardsPerPlayer) {
      const delta = submittedCallsSum - defaultTotalCardsPerPlayer;

      prefix = `Déjà ${delta} pli${delta > 1 ? 's' : ''} au-dessus du quota !`;
    } else {
      const delta = defaultTotalCardsPerPlayer - submittedCallsSum;

      prefix = `${submittedCallsSum} pli${submittedCallsSum > 1 ? 's' : ''} demandé${submittedCallsSum > 1 ? 's' : ''}${!isLastCall ? `, à ${delta} pli${delta > 1 ? 's' : ''} du quota` : ' !'}`
    }


    if (mandatoryLastCall !== null) {
      suffix = ` Obligé(e) de dire ${mandatoryLastCall}`;
    } else if (isLastCall) {
      suffix = forbiddenLastCall === null ? ' Tu es libre !' :  ` Pas ${forbiddenLastCall}`;
    }

    return `${prefix}${suffix}`;
  };

  const shouldShowError = (inputIndex: number): boolean =>
    inputIndex === index && isInError;

  const getDefaultValue = (inputIndex: number): string => {
    if (typeof calls[inputIndex] === 'number') {
      return String(calls[inputIndex])
    }

    if (index === inputIndex && isLastCall && mandatoryLastCall !== null) {
      return String(mandatoryLastCall);
    }

    return '';
  }
  const isReadOnly = (inputIndex: number) => inputIndex < index || (inputIndex === index && isLastCall && mandatoryLastCall !== null);
  const getCallInputRef = (callIndex: number): RefObject<HTMLInputElement | null> | undefined =>
    callIndex === index ? currentInputRef : undefined;
  const isInputVisible = (inputIndex: number) => inputIndex <= index;

  if (mandatoryLastCall !== null && isMobile && !isCallDirty) {
    setState((prevState) => ({
      ...prevState,
      isCallDirty: true,
    }));
  }

  useEffect(() => {
    currentInputRef.current?.focus();

    if (isFixing) {
      currentInputRef.current?.select();
    }
  }, [index, isFixing]);

  useEffect(() => {
    if (isToValidate) {
      startButtonRef.current?.focus();
    }
  }, [isToValidate]);

  return (
    <Box width="100%">
      {!isComplete && (
        <>
          <input type="hidden" name="callIndex" value={index} />
          {isInError && (
            <input type="hidden" name="isCallInError" value="" />
          )}
          {isFixing && (
            <input type="hidden" name="isFixingCall" value=""/>
          )}
        </>
      )}
      <Box>
        <Table>
          <TableBody>
          {defaultPlayersInOrder.map((player, i) => (
              <TableRow key={player}>
                <TableCell>
                  <Box position="relative">
                    {shouldShowFixPreviousCallButton(i) && (
                      <Box position="absolute" right={0} top={8} zIndex={10}>
                        <Button startIcon={<UndoIcon />} variant="outlined" size="small" type="button"
                                onClick={fixPreviousCall}>Corriger</Button>
                      </Box>
                    )}
                    {shouldShowCallValidationButton(i) && (
                      <Box position="absolute" right={0} top={8} zIndex={10}>
                        <Button startIcon={<CheckIcon />} variant="outlined" size="small" type="button"
                                onClick={handleValidateCall}>Valider</Button>
                      </Box>
                    )}
                    {isInputVisible(i) ? (
                      <UncontrolledNumberInputField
                        fullWidth
                        autoFocus
                        name="call"
                        autoComplete="off"
                        variant="standard"
                        label={player}
                        onChange={handleCallChange}
                        defaultValue={getDefaultValue(i)}
                        helperText={getInputHelperText(i)}
                        error={shouldShowError(i)}
                        inputRef={getCallInputRef(i)}
                        slotProps={{
                          htmlInput: {
                            readOnly: isReadOnly(i),
                            onKeyDown: handleKeyDown,
                          }
                        }}
                      />
                    ) : (
                      <Box fontStyle="italic">
                        {player}
                      </Box>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
      <Box marginTop={4} display="flex" justifyContent="space-between">
        <Button disabled={isDisplayButtonDisabled} startIcon={<BackHandIcon />} variant="outlined" onClick={replayRound} color="error">
          Maldonne
        </Button>
        <Button ref={startButtonRef} disabled={!isToValidate} onClick={handleComplete} type="button" variant="outlined" startIcon={<OutlinedFlagIcon />}>
          C'est parti !
        </Button>
      </Box>
    </Box>
  );
}
