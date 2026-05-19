'use client';

import { Download } from 'lucide-react';

type CVDownloadProps = {
  visible: boolean;
};

export function CVDownload({ visible }: CVDownloadProps) {
  if (!visible) return null;

  return (
    <a
      href="/cv-ward.pdf"
      download
      className="inline-flex items-center gap-2 border-b border-ink/25 pb-0.5 font-body text-sm text-ink transition-colors hover:border-ink"
    >
      <Download className="size-3.5" strokeWidth={1.5} />
      Download CV
    </a>
  );
}
