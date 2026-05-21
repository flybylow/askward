'use client';

import { useEffect } from 'react';

/**
 * ElevenLabs WebRTC uses LiveKit. Its "lossy" data channel logs opaque errors
 * on disconnect / HMR — harmless but noisy. Keep LiveKit at warn+ in the console.
 */
export function LivekitLogInit() {
  useEffect(() => {
    void import('livekit-client')
      .then(({ setLogLevel, LogLevel }) => {
        setLogLevel(LogLevel.warn);
      })
      .catch(() => {
        /* livekit not available */
      });
  }, []);

  return null;
}
