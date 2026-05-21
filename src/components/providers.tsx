'use client';

import { ConversationProvider } from '@elevenlabs/react';
import { LivekitLogInit } from '@/components/LivekitLogInit';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConversationProvider>
      <LivekitLogInit />
      {children}
    </ConversationProvider>
  );
}
