'use client';

import { cn } from '@/lib/utils';
import type { Chapter } from '@/lib/chapters';
import type { ChapterId } from '@/lib/client-tools';

type SidebarProps = {
  chapters: Chapter[];
  active: ChapterId;
  onSelect: (id: ChapterId) => void;
};

export function Sidebar({ chapters, active, onSelect }: SidebarProps) {
  return (
    <nav aria-label="Chapters">
      <p className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-ink/45">
        Chapters
      </p>
      <p className="mt-2 max-w-sm font-body text-sm leading-relaxed text-ink/55">
        Click a topic, or just start talking.
      </p>

      <ol className="mt-10 flex flex-col">
        {chapters.map((chapter, index) => {
          const isActive = active === chapter.id;
          return (
            <li key={chapter.id}>
              <button
                type="button"
                onClick={() => onSelect(chapter.id)}
                className={cn(
                  'group relative w-full border-t border-ink/8 py-5 text-left transition-colors',
                  'hover:bg-ink/[0.02]',
                  isActive && 'bg-ink/[0.02]'
                )}
              >
                {/* Sage accent — the single color, one job */}
                <span
                  aria-hidden
                  className={cn(
                    'absolute bottom-5 left-0 top-5 w-[3px] rounded-full transition-opacity',
                    isActive ? 'bg-sage opacity-100' : 'opacity-0'
                  )}
                />

                <span className="flex items-baseline gap-4 pl-5">
                  <span className="font-body text-[11px] tabular-nums tracking-widest text-ink/35">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-heading text-[1.35rem] leading-tight tracking-[-0.01em] text-ink">
                      {chapter.label}
                    </span>
                    <span className="mt-1 block font-body text-sm leading-snug text-ink/50">
                      {chapter.oneLiner}
                    </span>
                  </span>
                </span>
              </button>
            </li>
          );
        })}
        <li aria-hidden className="border-t border-ink/8" />
      </ol>
    </nav>
  );
}
