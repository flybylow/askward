'use client';

import { useCallback, useEffect, useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import type { ChapterId, SubItemId } from '@/lib/topics';
import type { NavDebugToolEvent } from '@/lib/debug-nav';
import { cn } from '@/lib/utils';

const EXPANDED_STORAGE_KEY = 'askward:info-panel-expanded';

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
  const [isExpanded, setIsExpanded] = useState(false);
  const [mode, setMode] = useState<PanelMode>('info');

  useEffect(() => {
    setIsExpanded(localStorage.getItem(EXPANDED_STORAGE_KEY) === '1');
  }, []);

  const showDebug = useCallback(() => {
    setMode('debug');
    setIsExpanded(true);
  }, []);
  const showInfo = useCallback(() => setMode('info'), []);

  useSecretPhrase('debug', showDebug);
  useSecretPhrase('info', showInfo);

  const toggleExpanded = () => {
    setIsExpanded((prev) => {
      const next = !prev;
      localStorage.setItem(EXPANDED_STORAGE_KEY, next ? '1' : '0');
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
        'fixed bottom-4 right-4 z-[100] rounded border border-border-divider/20 bg-surface-panel font-mono leading-relaxed text-text-muted shadow-sm backdrop-blur-md',
        isExpanded
          ? 'max-w-[min(90vw,360px)] px-3 py-2 text-[10px]'
          : 'max-w-[min(72vw,200px)] px-2 py-1.5 text-[9px]'
      )}
      role="complementary"
      aria-label={title}
    >
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={isExpanded ? undefined : toggleExpanded}
          className={cn(
            'focus-ring text-left font-medium text-text-primary',
            !isExpanded && 'hover:underline'
          )}
          aria-expanded={isExpanded}
        >
          {title}
        </button>
        <button
          type="button"
          onClick={toggleExpanded}
          className="focus-ring shrink-0 rounded p-0.5 text-text-muted transition-colors hover:text-text-primary"
          aria-label={isExpanded ? 'Close panel' : 'Open panel'}
        >
          {isExpanded ? (
            <Minimize2 className="size-3.5" strokeWidth={1.5} />
          ) : (
            <Maximize2 className="size-3" strokeWidth={1.5} />
          )}
        </button>
      </div>

      {isExpanded && mode === 'info' && (
        <>
          {INFO_COPY.map((paragraph) => (
            <p key={paragraph} className="mt-1.5 text-text-muted">
              {paragraph}
            </p>
          ))}
        </>
      )}

      {isExpanded && mode === 'debug' && (
        <>
          <p className="mt-1">status: {conversationStatus}</p>
          <p>chapter: {chapterLabel}</p>
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
