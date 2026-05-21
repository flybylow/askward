'use client';

import '@/lib/patch-elevenlabs-error-event';
import '@/lib/suppress-livekit-console-noise';
import { ConversationProvider } from '@elevenlabs/react';

export function Providers({ children }: { children: React.ReactNode }) {
  return <ConversationProvider>{children}</ConversationProvider>;
}
