'use client';

import { CHAPTERS } from '@/lib/chapters';
import type { ChapterId } from '@/lib/client-tools';

type ReadModeProps = {
  chapterId: ChapterId;
  onExit: () => void;
};

export function ReadMode({ chapterId, onExit }: ReadModeProps) {
  const chapter = CHAPTERS.find((c) => c.id === chapterId);

  return (
    <div className="w-full max-w-xl border border-ink/10 bg-paper p-8">
      <div className="flex items-start justify-between gap-6">
        <h2 className="font-heading text-3xl tracking-tight text-ink">
          {chapter?.label ?? 'Chapter'}
        </h2>
        <button
          type="button"
          onClick={onExit}
          className="shrink-0 font-body text-xs uppercase tracking-[0.14em] text-ink/45 underline-offset-4 hover:text-ink hover:underline"
        >
          Back to voice
        </button>
      </div>
      <p className="mt-6 font-body text-base leading-relaxed text-ink/70">
        {chapter?.readModeText}
      </p>
    </div>
  );
}
