'use client';

import { useEffect, useRef } from 'react';
import { Download } from 'lucide-react';
import { cn } from '@/lib/utils';

type CVDownloadProps = {
  visible: boolean;
};

export function CVDownload({ visible }: CVDownloadProps) {
  const wasHidden = useRef(true);
  const shouldAnimate = visible && wasHidden.current;

  useEffect(() => {
    if (visible) wasHidden.current = false;
  }, [visible]);

  if (!visible) return null;

  return (
    <a
      href="/cv-ward.pdf"
      download
      className={cn(
        'focus-ring inline-flex items-center gap-2 rounded-md border border-border-divider px-4 py-2 text-sm text-text-primary transition-colors hover:bg-bg-subtle',
        shouldAnimate && 'animate-cv-surface-in'
      )}
    >
      <Download className="size-4" strokeWidth={1.5} />
      Download CV
    </a>
  );
}
