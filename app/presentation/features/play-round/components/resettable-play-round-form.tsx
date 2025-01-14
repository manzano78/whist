import type { RoundInfo } from '~/domain/entities/round-info';
import {
  use,
  useRef,
  useState
} from 'react';
import {
  type InitialRoundCallsRegistrationState,
  RoundCallsRegistration
} from '~/presentation/features/register-round-calls/components/round-calls-registration';
import { IsMobileContext } from '~/presentation/contexts/is-mobile-context';
import { Form, useNavigation } from 'react-router';
import { Box, Step, StepButton, Stepper } from '@mui/material';
import { RoundResultsRegistration } from '~/presentation/features/register-round-results';
import { RankingPreview } from '~/presentation/features/play-round/components/ranking-preview';
import type { Ranking } from '~/domain/entities/ranking';
import { RoundFightInfo } from '~/presentation/features/display-round-fight-info';
import { isCallsStepDraft, isResultsStepDraft, type RoundDraft } from '~/domain/entities/draft';
import { PLAY_ROUND_FORM_ID } from '~/presentation/features/play-round/constants';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import { useRoundDraft } from '~/presentation/features/play-round/hooks/use-round-draft';

interface ResettablePlayRoundFormProps {
  defaultRoundInfo: RoundInfo;
  defaultGameId: string;
  defaultRanking: Ranking;
  defaultDraft?: RoundDraft;
  replayRound: () => void;
}

export function ResettablePlayRoundForm(
  {
    replayRound,
    defaultRanking,
    defaultGameId,
    defaultDraft,
    defaultRoundInfo,
  }: ResettablePlayRoundFormProps,
) {
  const isMobile = use(IsMobileContext);
  const navigation = useNavigation();
  const [initialResults] = useState(() => defaultDraft && isResultsStepDraft(defaultDraft) ? defaultDraft.results : undefined);
  const [callsInitialState] = useState<InitialRoundCallsRegistrationState | undefined>(() => {
    if (!defaultDraft) {
      return undefined;
    }

    const {calls} = defaultDraft;

    if (isCallsStepDraft(defaultDraft)) {
      const {
        callIndex,
        isFixing,
        isInError,
      } = defaultDraft;

      return {
        calls,
        draft: {
          isFixing,
          isInError,
          index: callIndex,
        }
      };
    }

    return {calls};
  });
  const [submittedCalls, setSubmittedCalls] = useState(() => defaultDraft && isResultsStepDraft(defaultDraft) ? defaultDraft.calls : null);
  const formRef = useRef<HTMLFormElement>(null);
  const isSubmitting = navigation.formAction === `/games/${defaultGameId}/play`;
  const step = submittedCalls ? 'results' : 'calls';
  const activeStep = step === 'calls' ? 0 : 1;
  const isDesktop = !isMobile;

  useRoundDraft(defaultGameId, formRef);

  return (
    <Form ref={formRef} method="post" id={PLAY_ROUND_FORM_ID} style={{ height: '100%' }}>
      <Box display="flex" height="100%">
        {isDesktop && defaultRoundInfo.index > 0 && (
          <Box height="100%" padding={2} borderRight={(theme) => `solid 1px ${theme.palette.divider}`}>
            <Box marginTop={3}>
              <RankingPreview ranking={defaultRanking} gameId={defaultGameId}/>
            </Box>
          </Box>
        )}

        <Box flex={1} padding={2} overflow="auto">
          <input type="hidden" name="roundIndex" value={defaultRoundInfo.index}/>
          {defaultRoundInfo.playersInRoundOrder.map((player) => (
            <input key={player} type="hidden" name="player" value={player}/>
          ))}

          <Box width={isMobile ? '100%' : 350} margin="auto" position="relative">

            <Box display="flex" alignItems="center" gap={1} marginBottom={3} marginTop={3}>
              <ArrowRightAltIcon />
              <span>
                <strong>{defaultRoundInfo.totalCardsPerPlayer}</strong> carte{defaultRoundInfo.totalCardsPerPlayer > 1 ? 's' : ''},&nbsp;
                <strong>{defaultRoundInfo.dealer}</strong>&nbsp;distribue
              </span>
            </Box>

            {isMobile && defaultRoundInfo.index > 0 && (
              <Box marginBottom={2}>
                <RankingPreview ranking={defaultRanking} gameId={defaultGameId}/>
              </Box>
            )}

            <Box marginBottom={4}>
              <Stepper nonLinear activeStep={activeStep}>
                <Step completed={step === 'results'}>
                  <StepButton color="inherit">
                    Demandes
                  </StepButton>
                </Step>
                <Step completed={isSubmitting}>
                  <StepButton color="inherit">
                    Résultats
                  </StepButton>
                </Step>
              </Stepper>
            </Box>

            <Box display={step === 'calls' ? undefined : 'none'} width="100%">
              <RoundCallsRegistration
                defaultRoundInfo={defaultRoundInfo}
                onComplete={setSubmittedCalls}
                replayRound={replayRound}
                initialState={callsInitialState}
              />
            </Box>
            {submittedCalls && (
              <Box width="100%">
                <Box display="flex" justifyContent="end">
                  <RoundFightInfo totalCardsPerPlayer={defaultRoundInfo.totalCardsPerPlayer} calls={submittedCalls}/>
                </Box>
                <RoundResultsRegistration
                  defaultGameId={defaultGameId}
                  replayRound={replayRound}
                  defaultPlayersInRoundOrder={defaultRoundInfo.playersInRoundOrder}
                  defaultTotalCardsPerPlayer={defaultRoundInfo.totalCardsPerPlayer}
                  defaultCalls={submittedCalls}
                  initialResults={initialResults}
                />
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Form>
  );
}
