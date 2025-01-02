import type { RoundInfo } from '~/domain/entities/round-info';
import {
  type ComponentType,
  forwardRef,
  type ReactElement,
  type ReactNode,
  useEffect,
  useImperativeHandle,
  useState
} from 'react';
import {
  createRoundLocalStorage,
  type RoundFormStateDto
} from '~/presentation/features/play-round/infrastructure/round-form-local-storage';
import { RoundCallsRegistration } from '~/presentation/features/register-round-calls';
import { RegisterRoundResultsForm } from '~/presentation/features/register-round-results';
import {
  createRoundCallsRegistrationComponent,
  type RoundCallRegistrationProps
} from '~/presentation/features/register-round-calls/components/round-calls-registration';
import { createQueue } from '~/presentation/infrastructure/queue';

interface ResettablePlayRoundFormProps {
  defaultRoundInfo: RoundInfo;
  defaultRoundId: string;
  defaultTotalCardsPerPlayer: number;
  defaultPlayersInOrder: string[];
  resetForm: () => void;
  children: (arg: {
    RoundCallsRegistration: ComponentType<{ isCompact?: boolean }>;
    RoundResultsRegistration: ComponentType<{ isCompact?: boolean }>;
    ReplayButton: ComponentType;
    RoundInfo: ComponentType;
    Ranking: ComponentType;
    RoundFightNature: ComponentType;
    step: 'calls' | 'results'
  }) => ReactNode;
}

export function ResettablePlayRoundForm(
  {
    defaultRoundInfo,
    defaultRoundId,
    resetForm,
    defaultTotalCardsPerPlayer,
    defaultPlayersInOrder,
  }: ResettablePlayRoundFormProps,
) {
  const [RoundCallsRegistration] = useState(() => createRoundCallsRegistrationComponent({
    defaultTotalCardsPerPlayer,
    defaultPlayersInOrder,
  }));
  const [roundLocalStorage] = useState(() => createRoundLocalStorage(defaultRoundId));
  const [enqueue] = useState(createQueue);
  const [initialValues] = useState(roundLocalStorage.getRoundFormState)
  const [roundStep, setRoundStep] = useState(() => initialValues?.roundStep ?? 'calls');
  const registerResults = () => {
    setRoundStep('results');
  };

  const handleRegisterRoundCallsFormStateChange: RoundCallRegistrationProps['onChange'] = async (callsFormState) => {
    await enqueue(() => {
      roundLocalStorage.setRoundFormState({
        roundStep: 'calls',
        callsFormState,
      });
    });
  };

  const registerRoundCallsFormNode = (
    <RoundCallsRegistration
      defaultPlayersInOrder={defaultRoundInfo.playersInRoundOrder}
      defaultTotalCardsPerPlayer={defaultRoundInfo.totalCardsPerPlayer}
      initialState={initialValues?.callsFormState}
      onComplete={registerResults}
      onChange={handleRegisterRoundCallsFormStateChange}
    />
  );

  const registerRoundResultsFormNode = roundStep === 'results' ? (
    <RegisterRoundResultsForm
      defaultPlayersInRoundOrder={defaultRoundInfo.playersInRoundOrder}
      defaultTotalCardsPerPlayer={defaultRoundInfo.totalCardsPerPlayer}
      defaultCalls={{}}
    />
  ) : null;

  return null;
}
