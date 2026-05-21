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

export const HERO_INTRO_BUBBLES: TranscriptMessage[] = [
  {
    role: 'agent',
    text: 'Designing agents that work out of the box.',
    timestamp: new Date(0),
    beatIndex: 0,
    turnId: -1,
  },
  {
    role: 'agent',
    text: 'Twenty years between customers and products.',
    timestamp: new Date(0),
    beatIndex: 1,
    turnId: -1,
  },
];

const MAIN_FRAME_CLASS =
  'flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-lg bg-bg-subtle/60 max-lg:max-h-[calc(100dvh-7rem)] lg:h-[calc(100dvh-10rem)]';

type TranscriptProps = {
  messages: TranscriptMessage[];
  className?: string;
  /** Fill the main body column instead of a compact strip under the collage. */
  variant?: 'compact' | 'main';
};

export function Transcript({
  messages,
  className,
  variant = 'compact',
}: TranscriptProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isMain = variant === 'main';
  const hasLiveMessages = messages.length > 0;
  const showIntroCopy = isMain && !hasLiveMessages;
  const visibleMessages =
    hasLiveMessages ? messages : isMain ? [] : HERO_INTRO_BUBBLES;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [showIntroCopy, visibleMessages]);

  if (isMain) {
    return (
      <div className={MAIN_FRAME_CLASS}>
        <div
          ref={scrollRef}
          className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overscroll-contain px-4 py-3"
        >
            {showIntroCopy ? (
              <>
                <p className="font-serif text-[clamp(1.5rem,2.75vw,2.125rem)] leading-[1.12] tracking-[-0.02em] text-text-primary">
                  {HERO_INTRO_BUBBLES[0]?.text}
                </p>
                <p className="text-[clamp(0.8125rem,1.1vw,0.9375rem)] leading-snug text-text-muted">
                  {HERO_INTRO_BUBBLES[1]?.text}
                </p>
              </>
            ) : (
              <ul
                aria-live="polite"
                aria-relevant="additions"
                className="flex flex-col gap-4"
              >
                {visibleMessages.map((msg, i) => (
                  <li
                    key={`${msg.role}-${msg.turnId ?? ''}-${msg.beatIndex ?? ''}-${msg.timestamp.getTime()}-${i}`}
                    className={cn(
                      'max-w-full rounded-lg px-4 py-3 text-text-primary animate-in fade-in duration-200 ease-out',
                      msg.role === 'user'
                        ? 'ml-auto bg-bg-base text-base'
                        : 'mr-auto bg-bg-subtle'
                    )}
                  >
                    {msg.text}
                  </li>
                ))}
              </ul>
            )}
          </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex max-w-[600px] flex-col overflow-hidden rounded-lg bg-bg-subtle',
        className
      )}
      style={{ height: 'min(36vh, 280px)' }}
    >
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4"
      >
        <ul
          aria-live="polite"
          aria-relevant="additions"
          className="flex flex-col gap-4"
        >
          {visibleMessages.map((msg, i) => (
            <li
              key={`${msg.role}-${msg.turnId ?? ''}-${msg.beatIndex ?? ''}-${msg.timestamp.getTime()}-${i}`}
              className={cn(
                'max-w-full rounded-lg px-5 py-4 text-text-primary animate-in fade-in duration-200 ease-out',
                msg.role === 'user'
                  ? 'ml-auto bg-bg-base text-base'
                  : 'mr-auto bg-bg-subtle'
              )}
            >
              {msg.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
