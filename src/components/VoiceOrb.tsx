'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Loader2, PhoneOff } from 'lucide-react';

type VoiceOrbProps = {
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  isSpeaking: boolean;
  showPortrait?: boolean;
  onStart: () => void;
  onEnd: () => void;
  errorMessage?: string;
};

function orbAriaLabel(
  status: VoiceOrbProps['status'],
  isSpeaking: boolean,
  isConnecting: boolean
): string {
  if (isConnecting) return 'Connecting';
  if (status === 'connected') {
    return isSpeaking ? 'Ward is speaking' : 'Listening';
  }
  if (status === 'error') return 'Connection error — click to retry';
  return 'Click to start call';
}

export function VoiceOrb({
  status,
  isSpeaking,
  showPortrait = false,
  onStart,
  onEnd,
  errorMessage,
}: VoiceOrbProps) {
  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting';
  const isListening = isConnected && !isSpeaking;
  const isIdle = status === 'disconnected' || status === 'error';
  const canStart = isIdle && !isConnecting;

  const statusLine =
    errorMessage && (status === 'error' || status === 'disconnected')
      ? errorMessage
      : isConnecting
        ? 'Connecting…'
        : isConnected
          ? isSpeaking
            ? 'Ward is speaking'
            : 'Listening…'
          : 'Click to start';

  return (
    <div className="flex flex-col items-center gap-5">
      <button
        type="button"
        disabled={isConnecting}
        onClick={canStart ? onStart : undefined}
        aria-label={orbAriaLabel(status, isSpeaking, isConnecting)}
        className={cn(
          'focus-ring relative size-[152px] shrink-0 md:size-[200px]',
          canStart && 'cursor-pointer',
          isConnected && 'cursor-default',
          isConnecting && 'cursor-wait'
        )}
      >
        <Image
          src="/voice-collage.png"
          alt=""
          width={1024}
          height={1024}
          priority
          draggable={false}
          className={cn(
            'pointer-events-none size-full select-none object-contain transition-all duration-300',
            showPortrait && 'opacity-0',
            isListening && !showPortrait && 'animate-orb-breathe',
            isSpeaking && 'scale-[1.02]'
          )}
        />

        {showPortrait && (
          <Image
            src="/ward-portrait.png"
            alt=""
            width={400}
            height={400}
            className="pointer-events-none absolute inset-0 size-full select-none rounded-full object-cover opacity-90 mix-blend-multiply contrast-125 grayscale"
            onError={(e) => {
              const img = e.currentTarget;
              if (img.src.includes('hero-collage')) return;
              img.src = '/hero-collage.png';
            }}
          />
        )}

        {(isListening || isSpeaking || isConnecting) && (
          <span
            aria-hidden
            className={cn(
              'pointer-events-none absolute inset-[-6px] rounded-sm border-[1.5px] md:inset-[-8px]',
              isConnecting && 'border-orb-muted animate-orb-thinking',
              isListening && 'border-orb-active',
              isSpeaking && 'border-orb-active'
            )}
          />
        )}

        {isSpeaking && (
          <>
            <span className="pointer-events-none absolute inset-[-6px] animate-orb-ripple rounded-sm border border-orb-muted md:inset-[-8px]" />
            <span className="pointer-events-none absolute inset-[-6px] animate-orb-ripple-delay-1 rounded-sm border border-orb-muted md:inset-[-8px]" />
          </>
        )}

        {isConnecting && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-bg-base/40">
            <Loader2
              className="size-6 animate-spin text-text-primary"
              strokeWidth={1.5}
            />
          </span>
        )}
      </button>

      {canStart ? (
        <button
          type="button"
          onClick={onStart}
          className="focus-ring text-sm text-text-muted underline-offset-4 transition-colors hover:text-text-primary hover:underline"
        >
          {statusLine}
        </button>
      ) : (
        <p className="max-w-xs text-center text-sm text-text-muted">{statusLine}</p>
      )}

      {isConnected && (
        <button
          type="button"
          onClick={onEnd}
          aria-label="End call"
          className="focus-ring inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-text-muted transition-colors hover:bg-bg-subtle hover:text-text-primary"
        >
          <PhoneOff className="size-4" strokeWidth={1.5} />
          End call
        </button>
      )}
    </div>
  );
}
