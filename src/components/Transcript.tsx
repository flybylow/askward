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

const INTRO_COPY_CLASS =
  'w-full shrink-0 rounded-lg border border-border-divider/20 bg-violet-500/12 px-6 py-5 backdrop-blur-md';

const INTRO_HEADLINE_CLASS =
  'font-serif text-[clamp(1.75rem,3.25vw,2.375rem)] leading-[1.14] tracking-[-0.02em] text-text-primary';

const INTRO_SUBHEAD_CLASS =
  'mt-3 text-[clamp(0.9375rem,1.35vw,1.0625rem)] leading-relaxed text-text-muted';

type TranscriptProps = {
  messages: TranscriptMessage[];
  className?: string;
  /** Fill the main body column instead of a compact strip under the collage. */
  variant?: 'compact' | 'main';
  /** Scroll the matching agent beat into view (What I've built sub-items). */
  scrollToBeatIndex?: number | null;
};

export function Transcript({
  messages,
  className,
  variant = 'compact',
  scrollToBeatIndex = null,
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
    if (scrollToBeatIndex != null) {
      const beatEl = el.querySelector(
        `[data-beat-index="${scrollToBeatIndex}"]`
      );
      if (beatEl) {
        beatEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        return;
      }
    }
    el.scrollTop = el.scrollHeight;
  }, [showIntroCopy, visibleMessages, scrollToBeatIndex]);

  if (isMain) {
    if (showIntroCopy) {
      return (
        <div className={INTRO_COPY_CLASS}>
          <p className={INTRO_HEADLINE_CLASS}>
            {HERO_INTRO_BUBBLES[0]?.text}
          </p>
          <p className={INTRO_SUBHEAD_CLASS}>
            {HERO_INTRO_BUBBLES[1]?.text}
          </p>
        </div>
      );
    }

    return (
      <div
        ref={scrollRef}
        className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain"
      >
        <ul
          aria-live="polite"
          aria-relevant="additions"
          className="flex flex-col gap-4"
        >
          {visibleMessages.map((msg, i) => (
            <li
              key={`${msg.role}-${msg.turnId ?? ''}-${msg.beatIndex ?? ''}-${msg.timestamp.getTime()}-${i}`}
              data-beat-index={
                msg.role === 'agent' && msg.beatIndex != null
                  ? msg.beatIndex
                  : undefined
              }
              className={cn(
                'max-w-full rounded-lg px-4 py-3 text-text-primary animate-in fade-in duration-200 ease-out',
                msg.role === 'user'
                  ? 'ml-auto bg-bg-subtle text-base'
                  : 'mr-auto bg-bg-subtle'
              )}
            >
              {msg.text}
            </li>
          ))}
        </ul>
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
              data-beat-index={
                msg.role === 'agent' && msg.beatIndex != null
                  ? msg.beatIndex
                  : undefined
              }
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
