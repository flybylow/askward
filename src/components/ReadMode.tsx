'use client';

import { chapterReadModeText, getChapter } from '@/lib/topics';
import type { ChapterId } from '@/lib/client-tools';

type ReadModeProps = {
  chapterId: ChapterId | null;
  onExit: () => void;
};

export function ReadMode({ chapterId, onExit }: ReadModeProps) {
  const chapter = chapterId ? getChapter(chapterId) : null;

  return (
    <article className="animate-read-mode-in w-full max-w-[640px]">
      <h2 className="font-serif text-[1.5rem] leading-tight text-text-primary md:text-[2rem]">
        {chapter?.label ?? 'Talk to Ward'}
      </h2>
      <p className="mt-6 max-w-[70ch] whitespace-pre-line text-chat text-text-primary">
        {chapterId
          ? chapterReadModeText(chapterId)
          : 'Select a chapter on the left to read Ward’s notes.'}
      </p>
      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={onExit}
          className="focus-ring rounded-md px-4 py-2 text-sm text-text-muted transition-colors hover:bg-bg-subtle hover:text-text-primary"
        >
          Back to voice
        </button>
      </div>
    </article>
  );
}
