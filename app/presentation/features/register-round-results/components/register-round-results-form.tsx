import { useMemo, useRef } from 'react';

interface RegisterRoundResultsFormProps {
  defaultPlayersInRoundOrder: string[];
  defaultTotalCardsPerPlayer: number;
  defaultCalls: { [player: string]: number };
}
export function RegisterRoundResultsForm(
  {
    defaultPlayersInRoundOrder: defaultPlayersInRoundOrderProp,
    defaultTotalCardsPerPlayer: defaultTotalCardsPerPlayerProp,
    defaultCalls: defaultCallsProp
  }: RegisterRoundResultsFormProps
) {
  const { current: defaultPlayersInRoundOrder } = useRef(defaultPlayersInRoundOrderProp);
  const { current: defaultCalls } = useRef(defaultCallsProp);
  const { current: defaultTotalCardsPerPlayer } = useRef(defaultTotalCardsPerPlayerProp);
  const defaultTotalCalls = useMemo(
    () => Object.values(defaultCalls).reduce((acc, call) => acc + call, 0),
    [defaultCalls]
  );
  const delta = defaultTotalCardsPerPlayer - defaultTotalCalls;

  return null;
}