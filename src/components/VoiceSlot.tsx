'use client';

import { useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import type { OrbPhase } from '@/lib/orb-phase';
import { VoiceOrb, VoiceOrbControls, voiceStatusLine } from '@/components/VoiceOrb';

/**
 * Sage circle anchor — values live in CSS vars (globals.css :root) for browser tuning.
 * --sage-orb-top, --sage-orb-size, --sage-orb-inner, --sage-orb-shift-y
 */

type VoiceSlotProps = {
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  phase: OrbPhase;
  onStart: () => void;
  onEnd: () => void;
  errorMessage?: string;
  className?: string;
  /** Overlay on hero collage, inline stack, or compact horizontal row (mobile). */
  variant?: 'overlay' | 'inline' | 'horizontal';
};

/** Voice UI anchored to the sage circle on the hero collage. */
export function VoiceSlot({
  status,
  phase,
  onStart,
  onEnd,
  errorMessage,
  className,
  variant = 'overlay',
}: VoiceSlotProps) {
  const slotRef = useRef<HTMLDivElement>(null);
  const isIdle = status === 'disconnected' || status === 'error';
  const showCenterStatus =
    variant === 'overlay' && !isIdle && phase !== 'user-speaking';
  const statusLabel = voiceStatusLine(status, phase, errorMessage);

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const el = slotRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const nx = (event.clientX - rect.left) / rect.width - 0.5;
    const ny = (event.clientY - rect.top) / rect.height - 0.5;
    el.style.setProperty('--parallax-x', `${(-nx * 3).toFixed(2)}px`);
    el.style.setProperty('--parallax-y', `${(-ny * 3).toFixed(2)}px`);
  }, []);

  const handlePointerLeave = useCallback(() => {
    const el = slotRef.current;
    if (!el) return;
    el.style.setProperty('--parallax-x', '0px');
    el.style.setProperty('--parallax-y', '0px');
  }, []);

  return (
    <section
      ref={slotRef}
      aria-label="Voice conversation controls"
      className={cn(
        variant === 'overlay' ? 'pointer-events-none' : 'w-full',
        className
      )}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={
        {
          '--parallax-x': '0px',
          '--parallax-y': '0px',
        } as React.CSSProperties
      }
    >
      {variant === 'overlay' ? (
        <div className="sage-orb-anchor">
          <div className="flex size-full items-center justify-center">
            <div
              className={cn(
                'collage-centerpiece-parallax relative aspect-square shrink-0 overflow-visible transition-transform duration-[400ms] ease-out',
                isIdle &&
                  'translate-x-[var(--parallax-x)] translate-y-[var(--parallax-y)]'
              )}
              style={{ width: 'var(--sage-orb-inner)', height: 'var(--sage-orb-inner)' }}
            >
              <VoiceOrb
                embedded
                status={status}
                phase={phase}
                onStart={onStart}
                onEnd={onEnd}
                errorMessage={errorMessage}
                showControls={false}
              />

              {showCenterStatus && (
                <p
                  aria-live="polite"
                  className="pointer-events-none absolute inset-0 flex items-center justify-center px-4 text-center"
                >
                  <span className="inline-block rounded-md bg-white/90 px-3 py-1.5 text-sm text-text-primary shadow-sm">
                    {statusLabel}
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>
      ) : variant === 'horizontal' ? (
        <div
          className="pointer-events-auto flex w-full min-w-0 items-center gap-3 rounded-lg bg-bg-subtle/60 px-3 py-2.5"
          aria-live="polite"
        >
          <div className="relative size-14 shrink-0">
            <VoiceOrb
              embedded
              status={status}
              phase={phase}
              onStart={onStart}
              onEnd={onEnd}
              errorMessage={errorMessage}
              showControls={false}
            />
          </div>
          <p className="min-w-0 text-sm text-text-muted">{statusLabel}</p>
        </div>
      ) : (
        <div className="flex w-full flex-col items-center gap-3">
          <div className="flex w-full flex-col items-center gap-4 rounded-xl bg-bg-subtle/60 px-4 py-5 shadow-sm backdrop-blur-sm">
            <div className="relative aspect-square w-full max-w-[200px] shrink-0">
              <VoiceOrb
                embedded
                status={status}
                phase={phase}
                onStart={onStart}
                onEnd={onEnd}
                errorMessage={errorMessage}
                showControls={false}
              />
              {showCenterStatus && (
                <p
                  aria-live="polite"
                  className="pointer-events-none absolute inset-0 flex items-center justify-center px-4 text-center"
                >
                  <span className="inline-block rounded-md bg-white/90 px-3 py-1.5 text-sm text-text-primary shadow-sm">
                    {statusLabel}
                  </span>
                </p>
              )}
            </div>
            <VoiceOrbControls
              status={status}
              phase={phase}
              onStart={onStart}
              onEnd={onEnd}
              errorMessage={errorMessage}
              hideStatusLine={showCenterStatus}
              className="w-full shrink-0 px-2 text-center"
            />
          </div>
        </div>
      )}
    </section>
  );
}
