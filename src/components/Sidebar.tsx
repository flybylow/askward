'use client';

import { type CSSProperties } from 'react';
import type { ChapterId, SubItemId } from '@/lib/topics';
import { cn } from '@/lib/utils';
import { TopicNav } from '@/components/TopicNav';

type SidebarProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeChapter: ChapterId | null;
  activeSubItem: SubItemId | null;
  visited: Set<ChapterId>;
  onSelectChapter: (id: ChapterId) => void;
  onSelectSubItem: (id: SubItemId) => void;
};

const NAV_ID = 'chapter-navigation';
/** Content width — longest label is "What I've built". */
const NAV_WIDTH = '6.25rem'; /* 100px — ~half of prior 11.5rem */

export function Sidebar({
  open,
  onOpenChange: _onOpenChange,
  activeChapter,
  activeSubItem,
  visited,
  onSelectChapter,
  onSelectSubItem,
}: SidebarProps) {
  return (
    <aside
      aria-hidden={!open}
      className={cn(
        'shrink-0 overflow-hidden transition-[width,padding] duration-300 ease-out',
        open ? 'w-[var(--nav-width)] px-2 pt-6 pb-6' : 'w-0 px-0 pt-6 pb-6'
      )}
      style={{ '--nav-width': NAV_WIDTH } as CSSProperties}
    >
      <div className="sticky top-0 max-h-screen w-full overflow-y-auto">
        <TopicNav
          activeChapter={activeChapter}
          activeSubItem={activeSubItem}
          visited={visited}
          onSelectChapter={onSelectChapter}
          onSelectSubItem={onSelectSubItem}
          className="max-h-full overflow-y-auto"
          id={NAV_ID}
          compact
        />
      </div>
    </aside>
  );
}

export { NAV_ID };
