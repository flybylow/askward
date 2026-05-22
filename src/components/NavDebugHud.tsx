'use client';

import { useCallback, useEffect, useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import type { ChapterId, SubItemId } from '@/lib/topics';
import type { NavDebugToolEvent } from '@/lib/debug-nav';
import { cn } from '@/lib/utils';

const COMPACT_STORAGE_KEY = 'askward:nav-debug-compact';

const INFO_COPY = [
  'A voice portfolio by Ward De Muynck. You hear Ward speak in real time through ElevenLabs Conversational AI.',
  'Use the menu to pick a chapter, or ask a question in your own words. The agent follows short scripted beats and can go deeper when you ask.',
  'Built as a working sample for the AI Agent Designer role at Open — the medium is the message.',
];

type PanelMode = 'info' | 'debug';

type NavDebugHudProps = {
  conversationStatus: string;
  activeChapter: ChapterId | null;
  activeSubItem: SubItemId | null;
  lastTool: NavDebugToolEvent | null;
  registeredTools: string[];
};

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    target.isContentEditable
  );
}

function useSecretPhrase(phrase: string, onMatch: () => void) {
  useEffect(() => {
    let buffer = '';
    const handler = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;
      buffer = (buffer + event.key.toLowerCase()).slice(-(phrase.length + 4));
      if (buffer.endsWith(phrase)) {
        onMatch();
        buffer = '';
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [phrase, onMatch]);
}

export function NavDebugHud({
  conversationStatus,
  activeChapter,
  activeSubItem,
  lastTool,
  registeredTools,
}: NavDebugHudProps) {
  const [compact, setCompact] = useState(false);
  const [mode, setMode] = useState<PanelMode>('info');

  useEffect(() => {
    setCompact(localStorage.getItem(COMPACT_STORAGE_KEY) === '1');
  }, []);

  const showDebug = useCallback(() => setMode('debug'), []);
  const showInfo = useCallback(() => setMode('info'), []);

  useSecretPhrase('debug', showDebug);
  useSecretPhrase('info', showInfo);

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

  const title = mode === 'info' ? 'What is this?' : 'Nav debug';

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-[100] rounded border border-border-divider bg-bg-base/95 font-mono leading-relaxed text-text-muted shadow-sm backdrop-blur-sm',
        compact
          ? 'max-w-[min(72vw,220px)] px-2 py-1.5 text-[9px]'
          : 'max-w-[min(90vw,360px)] px-3 py-2 text-[10px]'
      )}
      role="complementary"
      aria-label={title}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium text-text-primary">{title}</p>
        <button
          type="button"
          onClick={toggleCompact}
          className="focus-ring -mr-0.5 -mt-0.5 rounded p-0.5 text-text-muted transition-colors hover:text-text-primary"
          aria-label={compact ? 'Expand panel' : 'Compact panel'}
        >
          {compact ? (
            <Maximize2 className="size-3" strokeWidth={1.5} />
          ) : (
            <Minimize2 className="size-3.5" strokeWidth={1.5} />
          )}
        </button>
      </div>

      {mode === 'info' ? (
        <>
          {!compact &&
            INFO_COPY.map((paragraph) => (
              <p key={paragraph} className="mt-1.5 text-text-muted">
                {paragraph}
              </p>
            ))}
          {compact && (
            <p className="mt-0.5 text-text-muted">Voice portfolio agent</p>
          )}
        </>
      ) : (
        <>
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
          <button
            type="button"
            onClick={() => setMode('info')}
            className="focus-ring mt-1.5 text-left text-text-muted underline-offset-2 hover:text-text-primary hover:underline"
          >
            What is this?
          </button>
        </>
      )}
    </div>
  );
}
