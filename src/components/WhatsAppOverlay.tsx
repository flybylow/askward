'use client';

import { useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getWhatsAppUrl } from '@/lib/whatsapp';

type WhatsAppOverlayProps = {
  open: boolean;
  onClose: () => void;
  className?: string;
};

/** Full-screen WhatsApp escape hatch — opened by connect_to_ward. */
export function WhatsAppOverlay({
  open,
  onClose,
  className,
}: WhatsAppOverlayProps) {
  const url = getWhatsAppUrl();

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
      aria-labelledby="whatsapp-overlay-title"
      className={cn(
        'fixed inset-0 z-[200] flex items-center justify-center bg-bg-base/95 p-6 backdrop-blur-sm',
        className
      )}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="focus-ring absolute right-6 top-6 rounded-md p-2 text-text-muted transition-colors hover:bg-bg-subtle hover:text-text-primary"
      >
        <X className="size-5" strokeWidth={1.5} />
      </button>

      <div className="flex w-full max-w-md flex-col items-center gap-6 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-[#25D366]/10 text-[#25D366]">
          <MessageCircle className="size-8" strokeWidth={1.5} />
        </div>

        <div className="flex flex-col gap-2">
          <h2
            id="whatsapp-overlay-title"
            className="font-serif text-2xl text-text-primary"
          >
            Continue on WhatsApp
          </h2>
          <p className="text-sm leading-relaxed text-text-muted">
            Prefer text chat? Open a direct message and pick up the conversation
            there.
          </p>
        </div>

        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring inline-flex w-full max-w-xs items-center justify-center rounded-md bg-[#25D366] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#20bd5a]"
          >
            Open WhatsApp
          </a>
        ) : (
          <p className="text-sm text-text-muted">
            WhatsApp is not configured yet. Set{' '}
            <code className="text-text-primary">NEXT_PUBLIC_WHATSAPP_URL</code>{' '}
            or phone + message env vars.
          </p>
        )}

        <button
          type="button"
          onClick={onClose}
          className="focus-ring text-sm text-text-muted underline-offset-2 hover:text-text-primary hover:underline"
        >
          Stay here
        </button>
      </div>
    </div>
  );
}
