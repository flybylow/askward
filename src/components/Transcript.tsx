'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import type { TopicId } from '@/lib/client-tools';

export type TranscriptMessage = {
  role: 'user' | 'agent';
  text: string;
  timestamp: Date;
  topicId?: TopicId;
  beatIndex?: number;
  turnId?: number;
};

type TranscriptProps = {
  messages: TranscriptMessage[];
};

const TRANSCRIPT_HEIGHT = 'min(36vh, 280px)';

export function Transcript({ messages }: TranscriptProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  return (
    <div
      className="flex w-full max-w-[640px] flex-col overflow-hidden rounded-sm border border-border-divider bg-bg-base"
      style={{ height: TRANSCRIPT_HEIGHT }}
    >
      {messages.length === 0 ? (
        <p className="flex flex-1 items-center justify-center px-4 text-center text-sm text-text-muted">
          Transcript appears here once you start talking.
        </p>
      ) : (
        <div
          ref={scrollRef}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4"
        >
          <ul
            aria-live="polite"
            aria-relevant="additions"
            className="flex flex-col gap-3"
          >
            {messages.map((msg, i) => (
              <li
                key={`${msg.role}-${msg.turnId ?? ''}-${msg.beatIndex ?? ''}-${msg.timestamp.getTime()}-${i}`}
                className={cn(
                  'max-w-[88%] rounded-sm px-4 py-3 text-chat text-text-primary animate-in fade-in duration-300',
                  msg.role === 'user'
                    ? 'ml-auto border border-border-divider bg-bg-base'
                    : 'mr-auto border border-border-divider bg-bg-subtle'
                )}
              >
                {msg.text}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
