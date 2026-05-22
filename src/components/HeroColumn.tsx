'use client';

import Image from 'next/image';
import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils';
import type { OrbPhase } from '@/lib/orb-phase';
import { VoiceSlot } from '@/components/VoiceSlot';

/** Portrait collage — 571×1024 (9:16) */
const COLLAGE_WIDTH = 571;
const COLLAGE_HEIGHT = 1024;

/** Inline backup — beats stale CSS / @layer overrides on mobile. */
const HERO_FRAME_STYLE: CSSProperties = {
  position: 'fixed',
  top: 0,
  right: 0,
  bottom: 0,
  zIndex: 0,
  overflow: 'hidden',
  pointerEvents: 'none',
  aspectRatio: '571 / 1024',
  width: 'auto',
  height: 'auto',
  minHeight: '100dvh',
};

type HeroColumnProps = {
  className?: string;
  active?: boolean;
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  phase: OrbPhase;
  onStart: () => void;
  onEnd: () => void;
  errorMessage?: string;
};

/** Hero collage + ElevenLabs orb — one fixed viewport-sized container. */
export function HeroColumn({
  className,
  active = false,
  status,
  phase,
  onStart,
  onEnd,
  errorMessage,
}: HeroColumnProps) {
  return (
    <aside
      data-layer="collage"
      data-active={active ? 'true' : 'false'}
      aria-hidden
      className={cn('hero-collage-frame', className)}
      style={HERO_FRAME_STYLE}
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
          sizes="100vw"
        />
      </div>

      <VoiceSlot
        status={status}
        phase={phase}
        onStart={onStart}
        onEnd={onEnd}
        errorMessage={errorMessage}
        className="absolute inset-0 z-20"
      />
    </aside>
  );
}
