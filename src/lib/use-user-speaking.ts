import { useCallback, useEffect, useRef, useState } from 'react';

const VAD_ON_THRESHOLD = 0.42;
const VAD_HOLD_MS = 320;

type UseUserSpeakingOptions = {
  enabled: boolean;
  /** When true, ignore mic activity (agent is speaking). */
  suppress: boolean;
};

/**
 * Tracks whether the user is speaking from ElevenLabs `onVadScore` events.
 */
export function useUserSpeaking({ enabled, suppress }: UseUserSpeakingOptions) {
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHold = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }, []);

  const onVadScore = useCallback(
    ({ vadScore }: { vadScore: number }) => {
      if (!enabled || suppress) return;

      if (vadScore >= VAD_ON_THRESHOLD) {
        setIsUserSpeaking(true);
        clearHold();
        holdTimerRef.current = setTimeout(() => {
          setIsUserSpeaking(false);
          holdTimerRef.current = null;
        }, VAD_HOLD_MS);
      }
    },
    [clearHold, enabled, suppress]
  );

  useEffect(() => {
    if (!enabled || suppress) {
      clearHold();
      setIsUserSpeaking(false);
    }
  }, [clearHold, enabled, suppress]);

  useEffect(() => () => clearHold(), [clearHold]);

  return { isUserSpeaking, onVadScore };
}
