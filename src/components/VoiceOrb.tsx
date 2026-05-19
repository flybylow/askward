'use client';

import { cn } from '@/lib/utils';

type VoiceOrbProps = {
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  isSpeaking: boolean;
  onStart: () => void;
  onEnd: () => void;
  errorMessage?: string;
};

export function VoiceOrb({
  status,
  isSpeaking,
  onStart,
  onEnd,
  errorMessage,
}: VoiceOrbProps) {
  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting';
  const isListening = isConnected && !isSpeaking;

  return (
    <div className="flex flex-col items-center gap-5">
      <button
        type="button"
        disabled={isConnecting}
        onClick={isConnected ? undefined : onStart}
        className={cn(
          'relative flex size-36 items-center justify-center rounded-full border border-ink/20 bg-paper transition-all duration-300',
          isConnected
            ? 'cursor-default'
            : 'cursor-pointer hover:border-ink/40 hover:bg-ink/[0.02]',
          isConnecting && 'animate-pulse border-ink/35',
          isSpeaking && 'border-ink/50 shadow-[0_0_0_1px_rgba(5,5,5,0.06)]'
        )}
        aria-label={isConnected ? 'Voice session active' : 'Start voice session'}
      >
        {isListening && (
          <span className="absolute inset-0 animate-pulse rounded-full border border-ink/10" />
        )}
        {isSpeaking && (
          <span className="absolute inset-3 animate-pulse rounded-full bg-ink/[0.04]" />
        )}
        <span
          className={cn(
            'relative z-10 size-14 rounded-full transition-all duration-300',
            isConnected ? 'bg-ink' : 'bg-ink/15',
            isSpeaking && 'scale-110',
            isListening && 'scale-95'
          )}
        />
      </button>

      <p className="max-w-[14rem] text-center font-body text-sm text-ink/55">
        {errorMessage && status === 'error'
          ? errorMessage
          : isConnecting
            ? 'Connecting…'
            : isConnected
              ? isSpeaking
                ? 'Ward is speaking'
                : 'Listening…'
              : 'Click to start'}
      </p>

      {isConnected && (
        <button
          type="button"
          onClick={onEnd}
          className="font-body text-xs uppercase tracking-[0.14em] text-ink/45 underline-offset-4 transition-colors hover:text-ink hover:underline"
        >
          End call
        </button>
      )}
    </div>
  );
}
