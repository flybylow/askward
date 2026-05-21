'use client';

import { cn } from '@/lib/utils';
import { Loader2, PhoneOff } from 'lucide-react';

type VoiceOrbBaseProps = {
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  isSpeaking: boolean;
  onStart: () => void;
  onEnd: () => void;
  errorMessage?: string;
};

type VoiceOrbControlsProps = VoiceOrbBaseProps & {
  className?: string;
  hideStatusLine?: boolean;
  /** Hide start button (e.g. when start lives in HeroIntro). */
  hideStartButton?: boolean;
};

type VoiceOrbProps = VoiceOrbBaseProps & {
  /** Return button only — parent owns layout and controls. */
  embedded?: boolean;
  showControls?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

function orbAriaLabel(
  status: VoiceOrbProps['status'],
  isSpeaking: boolean,
  isConnecting: boolean
): string {
  if (isConnecting) return 'Connecting';
  if (status === 'connected') {
    return isSpeaking ? 'Speaking' : 'Listening';
  }
  if (status === 'error') return 'Connection error — click to retry';
  return 'Click to start call';
}

function statusLine(
  status: VoiceOrbProps['status'],
  isSpeaking: boolean,
  isConnecting: boolean,
  errorMessage?: string
): string {
  if (errorMessage && (status === 'error' || status === 'disconnected')) {
    return errorMessage;
  }
  if (isConnecting) return 'Connecting';
  if (status === 'connected') {
    return isSpeaking ? 'Speaking' : 'Listening';
  }
  return 'Click to start';
}

export function voiceStatusLine(
  status: VoiceOrbBaseProps['status'],
  isSpeaking: boolean,
  isConnecting: boolean,
  errorMessage?: string
): string {
  return statusLine(status, isSpeaking, isConnecting, errorMessage);
}

export function VoiceOrbControls({
  status,
  isSpeaking,
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
  const line = statusLine(status, isSpeaking, isConnecting, errorMessage);

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
  isSpeaking,
  onStart,
  onEnd,
  errorMessage,
  embedded = false,
  showControls,
  className,
  style,
}: VoiceOrbProps) {
  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting';
  const isListening = isConnected && !isSpeaking;
  const isIdle = status === 'disconnected' || status === 'error';
  const canStart = isIdle && !isConnecting;
  const controlsVisible = showControls ?? !embedded;

  const orbButton = (
    <button
      type="button"
      disabled={isConnecting}
      onClick={canStart ? onStart : undefined}
      aria-label={orbAriaLabel(status, isSpeaking, isConnecting)}
      className={cn(
        'focus-ring relative aspect-square w-full',
        canStart && 'cursor-pointer',
        isConnected && 'cursor-default',
        isConnecting && 'cursor-wait',
        className
      )}
      style={style}
    >
      {isIdle && canStart && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full border border-orb-muted/20"
        />
      )}

      {isListening && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 animate-orb-breathe rounded-full border border-orb-muted/20"
        />
      )}

      {(isListening || isSpeaking || isConnecting) && (
        <span
          aria-hidden
          className={cn(
            'pointer-events-none absolute inset-0 rounded-full border',
            isConnecting && 'border-orb-muted/25 animate-orb-thinking',
            isListening && 'border-orb-active/30',
            isSpeaking && 'border-orb-active/30'
          )}
        />
      )}

      {isSpeaking && (
        <>
          <span className="pointer-events-none absolute inset-0 animate-orb-ripple rounded-full border border-orb-muted/15" />
          <span className="pointer-events-none absolute inset-0 animate-orb-ripple-delay-1 rounded-full border border-orb-muted/15" />
        </>
      )}

      {isConnecting && (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-full">
          <Loader2
            className="size-6 animate-spin text-text-primary"
            strokeWidth={1.5}
          />
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
          isSpeaking={isSpeaking}
          onStart={onStart}
          onEnd={onEnd}
          errorMessage={errorMessage}
        />
      )}
    </div>
  );
}
