import type { RoundInfo } from '~/domain/entities/round-info';
import { useRef, useState } from 'react';
import { ResettablePlayRoundForm } from '~/presentation/features/play-round/components/resettable-play-round-form';
import type { Ranking } from '~/domain/entities/ranking';
import type { RoundDraft } from '~/domain/entities/draft';

interface PlayRoundFormProps {
  defaultRoundInfo: RoundInfo;
  defaultRanking: Ranking;
  defaultDraft?: RoundDraft;
  defaultGameId: string;
}

interface PlayRoundFormState {
  defaultDraft?: RoundDraft;
  roundFormKey: number;
}

export function PlayRoundForm(
  {
    defaultRoundInfo,
    defaultGameId,
    defaultRanking,
    defaultDraft: initialDefaultDraft
  }: PlayRoundFormProps
) {
  const [{ defaultDraft, roundFormKey }, setState] = useState<PlayRoundFormState>(() => ({
    defaultDraft: initialDefaultDraft,
    roundFormKey: 0,
  }));
  const { current: replayRound} = useRef(() => {
    setState((prevState) => ({
      roundFormKey: prevState.roundFormKey + 1,
    }));
  });

  return (
    <ResettablePlayRoundForm
      key={roundFormKey}
      replayRound={replayRound}
      defaultRoundInfo={defaultRoundInfo}
      defaultGameId={defaultGameId}
      defaultRanking={defaultRanking}
      defaultDraft={defaultDraft}
    />
  );
}
