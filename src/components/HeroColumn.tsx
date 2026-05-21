'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { VoiceSlot } from '@/components/VoiceSlot';

/** Portrait collage — 571×1024 (9:16) */
const COLLAGE_WIDTH = 571;
const COLLAGE_HEIGHT = 1024;

type HeroColumnProps = {
  className?: string;
  active?: boolean;
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  isSpeaking: boolean;
  onStart: () => void;
  onEnd: () => void;
  errorMessage?: string;
};

/** Hero collage + voice overlay — fixed to viewport, full height, right bleed. */
export function HeroColumn({
  className,
  active = false,
  status,
  isSpeaking,
  onStart,
  onEnd,
  errorMessage,
}: HeroColumnProps) {
  return (
    <aside
      data-layer="collage"
      data-active={active ? 'true' : 'false'}
      className={cn('hero-collage-frame pointer-events-none z-0', className)}
    >
      <div className="hero-collage-art">
        <Image
          src="/hero-collage.png"
          alt=""
          width={COLLAGE_WIDTH}
          height={COLLAGE_HEIGHT}
          priority
          draggable={false}
          aria-hidden
          sizes="(min-width: 1024px) 50vw, 140px"
        />
      </div>

      <VoiceSlot
        status={status}
        isSpeaking={isSpeaking}
        onStart={onStart}
        onEnd={onEnd}
        errorMessage={errorMessage}
        className="absolute inset-0 z-20"
      />
    </aside>
  );
}
