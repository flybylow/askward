'use client';

import { Mail, MessageCircle, Phone } from 'lucide-react';
import { FullScreenOverlay } from '@/components/FullScreenOverlay';
import { getSiteContactInfo } from '@/lib/site-contact';

type ContactOverlayProps = {
  open: boolean;
  onClose: () => void;
};

export function ContactOverlay({ open, onClose }: ContactOverlayProps) {
  const { email, phoneDisplay, phoneTel, whatsAppUrl } = getSiteContactInfo();

  return (
    <FullScreenOverlay
      open={open}
      onClose={onClose}
      title="Contact"
      titleId="contact-overlay-title"
    >
      <p className="text-sm leading-relaxed text-text-muted">
        Don&apos;t hesitate to get in touch with the real Ward. Send me an email
        or WhatsApp and I&apos;ll get back to you.
      </p>

      <ul className="flex w-full max-w-xs flex-col gap-3 text-left text-sm">
        <li>
          <a
            href={`mailto:${email}`}
            className="focus-ring inline-flex items-center gap-2 text-text-primary underline-offset-2 hover:underline"
          >
            <Mail className="size-4 shrink-0 text-text-muted" strokeWidth={1.5} />
            {email}
          </a>
        </li>
        <li>
          <a
            href={`tel:${phoneTel}`}
            className="focus-ring inline-flex items-center gap-2 text-text-primary underline-offset-2 hover:underline"
          >
            <Phone className="size-4 shrink-0 text-text-muted" strokeWidth={1.5} />
            {phoneDisplay}
          </a>
        </li>
      </ul>

      {whatsAppUrl ? (
        <a
          href={whatsAppUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="focus-ring inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-md bg-[#25D366] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#20bd5a]"
        >
          <MessageCircle className="size-4" strokeWidth={1.5} />
          Message on WhatsApp
        </a>
      ) : null}

      <button
        type="button"
        onClick={onClose}
        className="focus-ring text-sm text-text-muted underline-offset-2 hover:text-text-primary hover:underline"
      >
        Close
      </button>
    </FullScreenOverlay>
  );
}
