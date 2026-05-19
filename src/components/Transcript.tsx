'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export type TranscriptMessage = {
  role: 'user' | 'agent';
  text: string;
};

type TranscriptProps = {
  messages: TranscriptMessage[];
};

export function Transcript({ messages }: TranscriptProps) {
  const bottomRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <p className="max-w-md text-center font-body text-sm leading-relaxed text-ink/45">
        Transcript appears here once you start talking.
      </p>
    );
  }

  return (
    <div className="w-full max-w-lg">
      <ul className="flex max-h-52 flex-col gap-3 overflow-y-auto pr-1">
        {messages.map((msg, i) => (
          <li
            key={`${msg.role}-${i}`}
            className={cn(
              'max-w-[88%] rounded-sm px-4 py-3 font-body text-sm leading-relaxed',
              msg.role === 'user'
                ? 'ml-auto border border-ink/10 bg-paper text-ink'
                : 'mr-auto border border-ink/8 bg-ink/[0.03] text-ink/85'
            )}
          >
            {msg.text}
          </li>
        ))}
        <li ref={bottomRef} aria-hidden />
      </ul>
    </div>
  );
}
