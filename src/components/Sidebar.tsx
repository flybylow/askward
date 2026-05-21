'use client';

import { useCallback, useEffect, useState, type CSSProperties } from 'react';
import type { ChapterId, SubItemId } from '@/lib/topics';
import { cn } from '@/lib/utils';
import { TopicNav } from '@/components/TopicNav';
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet';

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
const DESKTOP_MQ = '(min-width: 1024px)';
/** Content width — longest label is "What I've built". */
const MOBILE_NAV_WIDTH = '9.75rem'; /* 156px */
const DESKTOP_NAV_WIDTH = '11.5rem'; /* 184px */

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_MQ);
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  return isDesktop;
}

export function Sidebar({
  open,
  onOpenChange,
  activeChapter,
  activeSubItem,
  visited,
  onSelectChapter,
  onSelectSubItem,
}: SidebarProps) {
  const isDesktop = useIsDesktop();

  const handleSelectChapter = useCallback(
    (id: ChapterId) => {
      onSelectChapter(id);
      if (!isDesktop) {
        onOpenChange(false);
      }
    },
    [isDesktop, onOpenChange, onSelectChapter]
  );

  const handleSelectSubItem = useCallback(
    (id: SubItemId) => {
      onSelectSubItem(id);
      if (!isDesktop) {
        onOpenChange(false);
      }
    },
    [isDesktop, onOpenChange, onSelectSubItem]
  );

  const navProps = {
    activeChapter,
    activeSubItem,
    visited,
    onSelectChapter: handleSelectChapter,
    onSelectSubItem: handleSelectSubItem,
    className: 'max-h-full overflow-y-auto',
    id: NAV_ID,
    compact: true,
  };

  if (!isDesktop) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="left"
          showCloseButton
          className="!w-[var(--nav-width-mobile)] !max-w-[var(--nav-width-mobile)] gap-0 border-border-divider bg-bg-base px-2.5 pb-4 pt-6 sm:!max-w-[var(--nav-width-mobile)]"
          style={
            {
              '--nav-width-mobile': MOBILE_NAV_WIDTH,
            } as CSSProperties
          }
        >
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <TopicNav {...navProps} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside
      aria-hidden={!open}
      className={cn(
        'shrink-0 overflow-hidden transition-[width,padding] duration-300 ease-out',
        open ? 'w-[var(--nav-width-desktop)] px-3 pt-4 pb-6 lg:pt-6' : 'w-0 px-0 pt-4 pb-6 lg:pt-6'
      )}
      style={{ '--nav-width-desktop': DESKTOP_NAV_WIDTH } as CSSProperties}
    >
      <div className="sticky top-0 w-full max-h-screen overflow-y-auto">
        <TopicNav {...navProps} />
      </div>
    </aside>
  );
}

export { NAV_ID };
