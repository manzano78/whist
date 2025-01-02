import type { RoundInfo } from '~/domain/entities/round-info';
import { forwardRef, type ReactElement, type ReactNode, useImperativeHandle, useRef, useState } from 'react';
import {
  ResettablePlayRoundForm,
  type ResettablePlayRoundFormRef
} from '~/presentation/features/play-round/components/resettable-play-round-form';

interface PlayRoundFormProps {
  defaultRoundInfo: RoundInfo;
  defaultRoundId: string;
  children: (arg: {
    resetFormButtonNode: ReactElement | null;
    registerRoundCallsFormNode: ReactElement;
    registerRoundResultsFormNode: ReactElement | null;
    roundFightInfoNode: ReactElement | null;
  }) => ReactNode;
}

export interface PlayRoundFormRef {
  resetForm: () => void;
}

export function PlayRoundForm(
  {
    defaultRoundInfo,
    defaultRoundId,
    children,
  }: PlayRoundFormProps
) {
  const [roundFormKey, setRoundFormKey] = useState(0);
  const { current: replay } = useRef(() => setRoundFormKey((prevRoundFormKey) => prevRoundFormKey + 1));

  return (
    <ResettablePlayRoundForm
      key={roundFormKey}
      resetForm={replay}
      defaultRoundInfo={defaultRoundInfo}
      defaultRoundId={defaultRoundId}
    >
      {children}
    </ResettablePlayRoundForm>
  );
}
