'use client';

import { Menu } from 'lucide-react';
import type { ChapterId, SubItemId } from '@/lib/topics';
import { TopicNav } from '@/components/TopicNav';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

type SidebarProps = {
  activeChapter: ChapterId | null;
  activeSubItem: SubItemId | null;
  visited: Set<ChapterId>;
  onSelectChapter: (id: ChapterId) => void;
  onSelectSubItem: (id: SubItemId) => void;
};

export function Sidebar({
  activeChapter,
  activeSubItem,
  visited,
  onSelectChapter,
  onSelectSubItem,
}: SidebarProps) {
  const nav = (
    <TopicNav
      activeChapter={activeChapter}
      activeSubItem={activeSubItem}
      visited={visited}
      onSelectChapter={onSelectChapter}
      onSelectSubItem={onSelectSubItem}
      className="max-h-full overflow-y-auto"
    />
  );

  return (
    <>
      <div className="absolute left-8 top-8 z-10 lg:hidden">
        <Sheet>
          <SheetTrigger className="focus-ring inline-flex items-center gap-2 rounded-md border border-border-divider px-4 py-2 text-sm text-text-primary transition-colors hover:bg-bg-subtle">
            <Menu className="size-4" strokeWidth={1.5} />
            Talk to Ward
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-full max-w-[280px] border-border-divider bg-bg-base p-8"
          >
            <SheetTitle className="sr-only">Talk to Ward</SheetTitle>
            {nav}
          </SheetContent>
        </Sheet>
      </div>
      <aside className="hidden w-[280px] shrink-0 px-8 py-6 lg:block">
        <div className="sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto">
          {nav}
        </div>
      </aside>
    </>
  );
}
