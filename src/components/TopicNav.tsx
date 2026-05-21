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
};

export function TopicNav({
  chapters = NAV_CHAPTERS,
  activeChapter,
  activeSubItem,
  visited,
  onSelectChapter,
  onSelectSubItem,
  className,
}: TopicNavProps) {
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
                  isChapterActive ? 'py-4' : 'py-2.5',
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
                    'block pl-3 text-sm leading-snug',
                    isChapterActive
                      ? 'font-normal text-sage'
                      : 'font-medium text-text-primary'
                  )}
                >
                  {chapter.label}
                </span>
              </button>

              {showSubItems && (
                <ul className="pb-2 pl-5">
                  {chapter.sub_items!.map((sub) => {
                    const isSubActive = activeSubItem === sub.id;
                    return (
                      <li key={sub.id}>
                        <button
                          type="button"
                          onClick={() => onSelectSubItem(sub.id)}
                          className={cn(
                            'focus-ring w-full py-1.5 text-left text-[12px] leading-snug transition-colors',
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
