let seq = 0;

function createPubSub<EventHavingPayload extends Record<string, any> = {}, EventNameNotHavingPayload extends string | never = never>() {
  const id = seq++;
  const toFinalEventType = (eventType: string) => `${id}:${eventType}`;

  function publish<E extends keyof EventHavingPayload>(eventType: E, detail: EventHavingPayload[E]): void;
  function publish(eventType: EventNameNotHavingPayload): void;
  function publish(eventType: string, detail = null): void {
    document.dispatchEvent(new CustomEvent(toFinalEventType(eventType), { detail }));
  }

  function subscribe<E extends keyof EventHavingPayload>(eventType: E, listener: (arg: { eventType: E; data: EventHavingPayload[E] }) => void): () => void;
  function subscribe(eventType: EventNameNotHavingPayload, listener: (arg: { eventType: EventNameNotHavingPayload; data: null}) => void): () => void;
  function subscribe(eventType: string, listener: (arg: { eventType: any; data: any }) => void): () => void {
    const finalEventType = toFinalEventType(eventType);
    const handler = (event: Event) => listener({ eventType, data: (event as CustomEvent).detail });

    document.addEventListener(finalEventType, handler);

    return () => {
      document.removeEventListener(finalEventType, handler);
    };
  }

  return { publish, subscribe };
}

const pubSub = createPubSub<
  {
    'navigation/game': { id: string }
  },
  'navigation/scores' | 'navigation/games'
>();
