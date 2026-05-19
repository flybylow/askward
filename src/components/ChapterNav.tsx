'use client';

import { cn } from '@/lib/utils';
import type { Chapter } from '@/lib/chapters';
import type { ChapterId } from '@/lib/client-tools';

type ChapterNavProps = {
  chapters: Chapter[];
  active: ChapterId;
  onSelect: (id: ChapterId) => void;
  className?: string;
};

export function ChapterNav({
  chapters,
  active,
  onSelect,
  className,
}: ChapterNavProps) {
  return (
    <nav aria-label="Talk to Ward" className={className}>
      <div className="mb-6">
        <p className="text-xs font-medium uppercase tracking-[0.1em] text-text-muted">
          Talk to Ward
        </p>
        <p className="mt-1.5 text-[13px] text-text-muted">
          Click any chapter, or just ask.
        </p>
      </div>

      <ol className="flex flex-col">
        {chapters.map((chapter, index) => {
          const isActive = active === chapter.id;
          return (
            <li key={chapter.id}>
              <button
                type="button"
                onClick={() => onSelect(chapter.id)}
                className={cn(
                  'focus-ring relative w-full border-b border-border-divider text-left transition-all duration-200 ease-out',
                  isActive ? 'py-4' : 'py-2'
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    'absolute bottom-0 left-0 top-0 w-0.5 bg-sage transition-opacity duration-200 ease-out',
                    isActive ? 'opacity-100' : 'opacity-0'
                  )}
                />

                <span className="flex items-baseline gap-3 pl-3">
                  <span
                    className={cn(
                      'font-serif text-sm tabular-nums leading-none',
                      isActive ? 'text-sage' : 'text-text-primary'
                    )}
                  >
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        'block text-sm leading-snug transition-colors duration-200',
                        isActive
                          ? 'font-normal text-sage'
                          : 'font-medium text-text-primary'
                      )}
                    >
                      {chapter.label}
                    </span>
                    {isActive && (
                      <span className="mt-1 block text-[13px] leading-snug text-text-muted">
                        {chapter.oneLiner}
                      </span>
                    )}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
