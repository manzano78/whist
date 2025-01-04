interface BaseDraft {
  roundIndex: number;
  calls: number[];
}

export interface CallsStepDraft extends BaseDraft {
  callIndex: number;
  isInError: boolean;
  isFixing: boolean;
}

export interface ResultsStepDraft extends BaseDraft {
  results: number[];
}

export type RoundDraft = CallsStepDraft | ResultsStepDraft;

export function isResultsStepDraft(draft: RoundDraft): draft is ResultsStepDraft {
  return !!(draft as ResultsStepDraft).results;
}

export function isCallsStepDraft(draft: RoundDraft): draft is CallsStepDraft {
  return !isResultsStepDraft(draft);
}
