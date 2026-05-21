'use client';

import { useEffect, useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { NAV_DEBUG_ENABLED } from '@/lib/debug-nav';
import type { ChapterId, SubItemId } from '@/lib/topics';
import type { NavDebugToolEvent } from '@/lib/debug-nav';
import { cn } from '@/lib/utils';

const COMPACT_STORAGE_KEY = 'askward:nav-debug-compact';

type NavDebugHudProps = {
  conversationStatus: string;
  activeChapter: ChapterId | null;
  activeSubItem: SubItemId | null;
  lastTool: NavDebugToolEvent | null;
  registeredTools: string[];
};

export function NavDebugHud({
  conversationStatus,
  activeChapter,
  activeSubItem,
  lastTool,
  registeredTools,
}: NavDebugHudProps) {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    setCompact(localStorage.getItem(COMPACT_STORAGE_KEY) === '1');
  }, []);

  if (!NAV_DEBUG_ENABLED) return null;

  const toggleCompact = () => {
    setCompact((prev) => {
      const next = !prev;
      localStorage.setItem(COMPACT_STORAGE_KEY, next ? '1' : '0');
      return next;
    });
  };

  const chapterLabel = activeChapter
    ? `${activeChapter}${activeSubItem ? ` / ${activeSubItem}` : ''}`
    : '—';

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-[100] rounded border border-border-divider bg-bg-base/95 font-mono leading-relaxed text-text-muted shadow-sm backdrop-blur-sm',
        compact
          ? 'max-w-[min(72vw,220px)] px-2 py-1.5 text-[9px]'
          : 'max-w-[min(90vw,360px)] px-3 py-2 text-[10px]'
      )}
      aria-hidden
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium text-text-primary">Nav debug</p>
        <button
          type="button"
          onClick={toggleCompact}
          className="focus-ring -mr-0.5 -mt-0.5 rounded p-0.5 text-text-muted transition-colors hover:text-text-primary"
          aria-label={compact ? 'Expand debug panel' : 'Compact debug panel'}
        >
          {compact ? (
            <Maximize2 className="size-3" strokeWidth={1.5} />
          ) : (
            <Minimize2 className="size-3.5" strokeWidth={1.5} />
          )}
        </button>
      </div>
      <p>status: {conversationStatus}</p>
      <p>chapter: {chapterLabel}</p>
      {!compact && (
        <>
          <p>tools: {registeredTools.join(', ') || '—'}</p>
          {lastTool ? (
            <p className="mt-1 text-sage">
              tool: {lastTool.name} ({lastTool.phase})
              {lastTool.parameters
                ? ` ${JSON.stringify(lastTool.parameters)}`
                : ''}
            </p>
          ) : (
            <p className="mt-1">tool: —</p>
          )}
        </>
      )}
    </div>
  );
}
