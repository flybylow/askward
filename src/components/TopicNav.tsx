'use client';

import { cn } from '@/lib/utils';
import type { Chapter, ChapterId, SubItemId } from '@/lib/topics';
import { NAV_CHAPTERS } from '@/lib/topics';

type TopicNavProps = {
  chapters?: Chapter[];
  activeChapter: ChapterId | null;
  activeSubItem: SubItemId | null;
  visited: Set<ChapterId>;
  onSelectChapter: (id: ChapterId) => void;
  onSelectSubItem: (id: SubItemId) => void;
  className?: string;
  id?: string;
  /** Tighter spacing for mobile sheet nav. */
  compact?: boolean;
};

export function TopicNav({
  chapters = NAV_CHAPTERS,
  activeChapter,
  activeSubItem,
  visited,
  onSelectChapter,
  onSelectSubItem,
  className,
  id,
  compact = false,
}: TopicNavProps) {
  return (
    <nav id={id} aria-label="Menu" className={className}>
      <div className={cn(compact ? 'mb-3' : 'mb-6')}>
        <p
          className={cn(
            'font-medium uppercase tracking-[0.1em] text-text-muted',
            compact ? 'text-[10px]' : 'text-xs'
          )}
        >
          Talk to Ward
        </p>
        {!compact && (
          <p className="mt-1.5 text-[13px] text-text-muted">
            Click any chapter, or just ask.
          </p>
        )}
      </div>

      <ol className="flex flex-col">
        {chapters.map((chapter) => {
          const isChapterActive = activeChapter === chapter.id;
          const showSubItems =
            isChapterActive && Boolean(chapter.sub_items?.length);
          const isVisited = visited.has(chapter.id);

          return (
            <li key={chapter.id} className="border-b border-border-divider">
              <button
                type="button"
                onClick={() => onSelectChapter(chapter.id)}
                className={cn(
                  'focus-ring relative w-full text-left transition-all duration-200 ease-out',
                  compact
                    ? isChapterActive
                      ? 'py-2'
                      : 'py-1.5'
                    : isChapterActive
                      ? 'py-4'
                      : 'py-2.5',
                  isVisited && !isChapterActive && 'opacity-50'
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    'absolute bottom-0 left-0 top-0 w-0.5 bg-sage transition-opacity duration-200',
                    isChapterActive ? 'opacity-100' : 'opacity-0'
                  )}
                />
                <span
                  className={cn(
                    'block leading-snug',
                    compact ? 'pl-1.5 text-[12px]' : 'pl-3 text-sm',
                    isChapterActive
                      ? 'font-normal text-sage'
                      : 'font-medium text-text-primary'
                  )}
                >
                  {chapter.label}
                </span>
              </button>

              {showSubItems && (
                <ul className={cn(compact ? 'pb-1 pl-3' : 'pb-2 pl-5')}>
                  {chapter.sub_items!.map((sub) => {
                    const isSubActive = activeSubItem === sub.id;
                    return (
                      <li key={sub.id}>
                        <button
                          type="button"
                          onClick={() => onSelectSubItem(sub.id)}
                          className={cn(
                            'focus-ring w-full text-left leading-snug transition-colors',
                            compact ? 'py-1 text-[11px]' : 'py-1.5 text-[12px]',
                            isSubActive
                              ? 'text-sage'
                              : 'text-[#666666] hover:text-text-primary'
                          )}
                        >
                          {sub.label}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
