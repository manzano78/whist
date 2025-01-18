import { type RefObject, useEffect } from 'react';
import type { RoundDraft } from '~/domain/entities/draft';
import { saveGameDraftToCookie } from '~/presentation/infrastructure/game-draft-storage/game-draft-cookie.client';

export function useRoundDraft(gameId: string, formRef: RefObject<HTMLFormElement | null | undefined>) {
  useEffect(() => {
    const { current: form } = formRef;

    if (!form) {
      return;
    }

    const observedInputs = new Set<HTMLInputElement>();

    const save = () => {
      const formData = new FormData(form);
      const roundIndex = Number(formData.get('roundIndex'));

      const calls = (formData.getAll('call') as string[]).filter((call) => !!call).map(Number);
      const rawCallIndex = formData.get('callIndex') as string | null;

      let roundDraft: RoundDraft;

      if (rawCallIndex !== null) {
        const callIndex = Number(rawCallIndex);
        const isInError = formData.has('isCallInError');
        const isFixing = formData.has('isFixingCall');

        roundDraft = {
          calls,
          callIndex,
          isFixing,
          isInError,
          roundIndex,
        };
      } else {
        const results = (formData.getAll('result') as string[]).filter((result) => !!result).map(Number);

        roundDraft = {
          calls,
          results,
          roundIndex,
        };
      }

      saveGameDraftToCookie(gameId, roundDraft);
    };

    const observeInputChange = (input: HTMLInputElement) => {
      input.addEventListener('change', save);
      input.addEventListener('input', save);
      observedInputs.add(input);
    };

    const unobserveInputChange = (input: HTMLInputElement) => {
      input.removeEventListener('change', save);
      input.removeEventListener('input', save);
      observedInputs.delete(input);
    };

    const observeElementIfRelevant = (node: Node) => {
      if ((node as HTMLElement).tagName === 'INPUT') {
        observeInputChange(node as HTMLInputElement);
      }
    };

    const unobserveElementIfRelevant = (node: Node) => {
      if ((node as HTMLElement).tagName === 'INPUT') {
        unobserveInputChange(node as HTMLInputElement);
      }
    };

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach(observeElementIfRelevant);
          mutation.removedNodes.forEach(unobserveElementIfRelevant);
        }
      });
      save();
    });

    form.querySelectorAll("input").forEach(observeInputChange);

    observer.observe(form, {
      childList: true, // Monitor child elements being added/removed
      subtree: true,   // Include nested elements
    });

    return () => {
      observer.disconnect();
      observedInputs.forEach(unobserveInputChange);
    };
  }, [gameId, formRef]);
}
