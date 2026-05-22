'use client';

import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

type FullScreenOverlayProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  titleId: string;
  children: ReactNode;
  className?: string;
};

/** Shared full-screen dialog shell (WhatsApp, Contact). */
export function FullScreenOverlay({
  open,
  onClose,
  title,
  titleId,
  children,
  className,
}: FullScreenOverlayProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={onClose}
      className={cn(
        'fixed inset-0 z-[200] flex items-center justify-center bg-bg-base/35 p-6 backdrop-blur-[2px]',
        className
      )}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="focus-ring absolute right-6 top-6 rounded-md p-2 text-text-muted transition-colors hover:bg-bg-subtle/80 hover:text-text-primary"
      >
        <X className="size-5" strokeWidth={1.5} />
      </button>

      <div
        onClick={(event) => event.stopPropagation()}
        className="flex w-full max-w-md flex-col items-center gap-6 rounded-xl border border-border-divider/25 bg-bg-base/65 p-8 text-center shadow-lg backdrop-blur-md"
      >
        <h2
          id={titleId}
          className="font-serif text-2xl text-text-primary"
        >
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}
