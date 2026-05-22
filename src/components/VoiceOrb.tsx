'use client';

import { cn } from '@/lib/utils';
import type { OrbPhase } from '@/lib/orb-phase';
import { orbStatusLine } from '@/lib/orb-phase';
import { Brain, Loader2, Mic, PhoneOff } from 'lucide-react';

type VoiceOrbBaseProps = {
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  phase: OrbPhase;
  onStart: () => void;
  onEnd: () => void;
  errorMessage?: string;
};

type VoiceOrbControlsProps = VoiceOrbBaseProps & {
  className?: string;
  hideStatusLine?: boolean;
  hideStartButton?: boolean;
};

type VoiceOrbProps = VoiceOrbBaseProps & {
  embedded?: boolean;
  showControls?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

const AGENT_RIPPLES = [
  'animate-orb-ripple',
  'animate-orb-ripple-delay-1',
  'animate-orb-ripple-delay-2',
  'animate-orb-ripple-delay-3',
  'animate-orb-ripple-delay-4',
] as const;

function orbAriaLabel(phase: OrbPhase): string {
  switch (phase) {
    case 'connecting':
      return 'Connecting';
    case 'thinking':
      return 'Thinking';
    case 'agent-speaking':
      return 'Agent speaking';
    case 'user-speaking':
      return 'You are speaking';
    case 'listening':
      return 'Listening';
    case 'idle':
    default:
      return 'Start agent';
  }
}

export function voiceStatusLine(
  status: VoiceOrbBaseProps['status'],
  phase: OrbPhase,
  errorMessage?: string
): string {
  return orbStatusLine(phase, errorMessage, status);
}

export function VoiceOrbControls({
  status,
  phase,
  onStart,
  onEnd,
  errorMessage,
  className,
  hideStatusLine = false,
  hideStartButton = false,
}: VoiceOrbControlsProps) {
  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting';
  const isIdle = status === 'disconnected' || status === 'error';
  const canStart = isIdle && !isConnecting && !hideStartButton;
  const line = voiceStatusLine(status, phase, errorMessage);

  if (!canStart && !isConnected && hideStatusLine) {
    return null;
  }

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      {canStart ? (
        <button
          type="button"
          onClick={onStart}
          className="focus-ring rounded-md bg-[var(--accent-orange)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-orange-hover)]"
        >
          {line}
        </button>
      ) : (
        !hideStatusLine && (
          <p className="max-w-xs text-center text-sm text-text-muted">{line}</p>
        )
      )}
      {isConnected && (
        <button
          type="button"
          onClick={onEnd}
          aria-label="End call"
          className="focus-ring inline-flex items-center gap-2 rounded-md bg-[var(--accent-orange)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-orange-hover)]"
        >
          <PhoneOff className="size-4" strokeWidth={1.5} />
          End call
        </button>
      )}
    </div>
  );
}

export function VoiceOrb({
  status,
  phase,
  onStart,
  onEnd,
  errorMessage,
  embedded = false,
  showControls,
  className,
  style,
}: VoiceOrbProps) {
  const isConnected = status === 'connected';
  const isIdle = status === 'disconnected' || status === 'error';
  const canStart = isIdle && phase !== 'connecting';
  const controlsVisible = showControls ?? !embedded;

  const showCenterIcon =
    phase === 'connecting' || phase === 'thinking' || phase === 'user-speaking';

  const orbButton = (
    <button
      type="button"
      disabled={phase === 'connecting'}
      onClick={canStart ? onStart : undefined}
      aria-label={orbAriaLabel(phase)}
      className={cn(
        'focus-ring relative aspect-square w-full overflow-visible transition-colors duration-300',
        canStart && 'cursor-pointer',
        isConnected && 'cursor-default',
        phase === 'connecting' && 'cursor-wait'
      )}
      style={style}
    >
      {isIdle && canStart && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full border border-orb-muted/20"
        />
      )}

      {phase === 'listening' && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 animate-orb-breathe rounded-full border border-orb-muted/25"
        />
      )}

      {phase === 'user-speaking' && (
        <>
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 animate-orb-user-speak rounded-full border-2 border-[var(--accent-orange)]/50 bg-[var(--accent-orange)]/8"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-[-8%] animate-orb-user-ring rounded-full border border-[var(--accent-orange)]/25"
          />
        </>
      )}

      {phase === 'thinking' && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 animate-orb-thinking rounded-full border border-sage/40 bg-sage/10"
        />
      )}

      {(phase === 'listening' ||
        phase === 'agent-speaking' ||
        phase === 'connecting') && (
        <span
          aria-hidden
          className={cn(
            'pointer-events-none absolute inset-0 rounded-full border',
            phase === 'connecting' && 'border-orb-muted/25 animate-orb-thinking',
            phase === 'listening' && 'border-orb-active/25',
            phase === 'agent-speaking' &&
              'border-orb-active/40 animate-orb-breathe'
          )}
        />
      )}

      {phase === 'agent-speaking' &&
        AGENT_RIPPLES.map((rippleClass) => (
          <span
            key={rippleClass}
            aria-hidden
            className={cn(
              'pointer-events-none absolute inset-[-12%] rounded-full border border-orb-active/30',
              rippleClass
            )}
          />
        ))}

      {showCenterIcon && (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-full">
          {phase === 'connecting' && (
            <Loader2
              className="size-6 animate-spin text-text-primary"
              strokeWidth={1.5}
            />
          )}
          {phase === 'thinking' && (
            <Brain
              className="size-7 animate-orb-thinking text-sage"
              strokeWidth={1.5}
            />
          )}
          {phase === 'user-speaking' && (
            <Mic
              className="size-6 text-[var(--accent-orange)]"
              strokeWidth={1.5}
            />
          )}
        </span>
      )}
    </button>
  );

  if (embedded && !controlsVisible) {
    return orbButton;
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="size-[152px] shrink-0 md:size-[200px]">{orbButton}</div>
      {controlsVisible && (
        <VoiceOrbControls
          status={status}
          phase={phase}
          onStart={onStart}
          onEnd={onEnd}
          errorMessage={errorMessage}
        />
      )}
    </div>
  );
}
