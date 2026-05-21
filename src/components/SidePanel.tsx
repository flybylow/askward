'use client';

import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Chapter, ChapterId } from '@/lib/topics';
import { chapterHasSidePanel, resolveChapterId } from '@/lib/topics';
import { playUiSound } from '@/lib/ui-sounds';

type SidePanelProps = {
  chapter: Chapter | undefined;
  dismissed: boolean;
  onDismiss: () => void;
  onNavigateChapter: (id: ChapterId) => void;
  onConnectWard: () => void;
  forceOpen?: boolean;
};

export function SidePanel({
  chapter,
  dismissed,
  onDismiss,
  onNavigateChapter,
  onConnectWard,
  forceOpen = false,
}: SidePanelProps) {
  if (!chapter || (!chapterHasSidePanel(chapter) && !forceOpen)) return null;
  if (dismissed && !forceOpen) return null;

  const sp = chapter.side_panel;

  const handleDismiss = () => {
    playUiSound('panelClose');
    onDismiss();
  };

  return (
    <aside
      className={cn(
        'flex w-full max-w-[280px] shrink-0 flex-col border-l border-border-divider bg-bg-base',
        'animate-in slide-in-from-right-2 duration-200'
      )}
      aria-label="Chapter resources"
    >
      <div className="flex items-center justify-between border-b border-border-divider px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-text-muted">
          Related
        </p>
        <button
          type="button"
          onClick={handleDismiss}
          className="focus-ring rounded p-1 text-text-muted hover:bg-bg-subtle hover:text-text-primary"
          aria-label="Dismiss panel"
        >
          <X className="size-4" strokeWidth={1.5} />
        </button>
      </div>

      <div className="flex flex-col gap-4 overflow-y-auto p-4">
        {sp?.links?.map((link) => (
          <a
            key={link.url + link.label}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring text-sm text-sage underline-offset-2 hover:underline"
          >
            {link.label}
          </a>
        ))}

        {sp?.choices?.map((choice) => {
          if (choice.tool === 'connect_to_ward') {
            return (
              <button
                key={choice.label}
                type="button"
                onClick={onConnectWard}
                className="focus-ring rounded-md bg-accent-orange px-4 py-2.5 text-left text-sm font-medium text-white transition-colors hover:bg-accent-orange-hover"
              >
                {choice.label}
              </button>
            );
          }

          if (choice.tool === 'navigate_to_topic' && choice.args?.topicId) {
            const targetId = resolveChapterId(choice.args.topicId);
            if (!targetId) return null;
            return (
              <button
                key={choice.label}
                type="button"
                onClick={() => onNavigateChapter(targetId)}
                className="focus-ring rounded-md border border-border-divider px-4 py-2.5 text-left text-sm text-text-primary transition-colors hover:bg-bg-subtle"
              >
                {choice.label}
              </button>
            );
          }

          return null;
        })}

        {sp?.prompts?.map((prompt) => (
          <p
            key={prompt}
            className="text-[13px] leading-snug text-text-muted"
          >
            {prompt}
          </p>
        ))}

        {forceOpen && (
          <button
            type="button"
            onClick={onConnectWard}
            className="focus-ring rounded-md bg-accent-orange px-4 py-2.5 text-left text-sm font-medium text-white transition-colors hover:bg-accent-orange-hover"
          >
            Connect to Ward on WhatsApp
          </button>
        )}
      </div>
    </aside>
  );
}
