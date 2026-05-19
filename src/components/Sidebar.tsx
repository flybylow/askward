'use client';

import { Menu } from 'lucide-react';
import type { Chapter } from '@/lib/chapters';
import type { ChapterId } from '@/lib/client-tools';
import { ChapterNav } from '@/components/ChapterNav';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

type SidebarProps = {
  chapters: Chapter[];
  active: ChapterId;
  onSelect: (id: ChapterId) => void;
};

export function Sidebar({ chapters, active, onSelect }: SidebarProps) {
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
            <ChapterNav
              chapters={chapters}
              active={active}
              onSelect={onSelect}
              className="max-h-full overflow-y-auto"
            />
          </SheetContent>
        </Sheet>
      </div>
      <aside className="hidden w-[280px] shrink-0 px-8 py-6 lg:block">
        <ChapterNav
          chapters={chapters}
          active={active}
          onSelect={onSelect}
          className="sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto"
        />
      </aside>
    </>
  );
}
