'use client';

import { cn } from '@/lib/utils';
import { Ear, Loader2, Menu, PhoneOff, Speech } from 'lucide-react';
import { voiceStatusLine } from '@/components/VoiceOrb';

type HeroIntroProps = {
  navOpen?: boolean;
  onToggleNav?: () => void;
  onTalkToMe?: () => void;
  isConnecting?: boolean;
  roleLabel?: string | null;
  status?: 'disconnected' | 'connecting' | 'connected' | 'error';
  isSpeaking?: boolean;
  onEnd?: () => void;
  errorMessage?: string;
  className?: string;
};

/** Menu toggle + badge row + CTAs. */
export function HeroIntro({
  navOpen = false,
  onToggleNav,
  onTalkToMe,
  isConnecting = false,
  roleLabel = null,
  status = 'disconnected',
  isSpeaking = false,
  onEnd,
  errorMessage,
  className,
}: HeroIntroProps) {
  const isConnected = status === 'connected';
  const isConnectingState =
    status === 'connecting' || isConnecting;
  const clickToStartLabel = voiceStatusLine(
    status,
    isSpeaking,
    isConnectingState,
    errorMessage
  );

  const primaryCtaClass =
    'focus-ring inline-flex w-fit items-center justify-center rounded-md bg-[var(--accent-orange)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-orange-hover)] disabled:cursor-wait disabled:opacity-70';

  const showListeningIcon = isConnected && !isSpeaking;
  const showSpeakingIcon = isConnected && isSpeaking;
  const showConnectingIcon = isConnectingState && !isConnected;

  return (
    <div
      className={cn(
        'flex w-full min-w-0 flex-nowrap items-center gap-2',
        className
      )}
    >
      <button
        type="button"
        onClick={() => onToggleNav?.()}
        aria-expanded={navOpen}
        aria-controls="chapter-navigation"
        aria-label={navOpen ? 'Close chapter menu' : 'Open chapter menu'}
        className="focus-ring relative z-20 inline-flex shrink-0 items-center justify-center rounded-full bg-border-divider px-2.5 py-1.5 text-text-primary transition-colors hover:bg-bg-subtle"
      >
        <Menu className="size-3 shrink-0 text-text-muted" strokeWidth={1.75} />
      </button>

      <span className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full bg-border-divider px-3 py-1.5 text-[13px] text-text-primary">
        {showSpeakingIcon && (
          <Speech
            className="size-3 shrink-0 text-text-muted"
            strokeWidth={1.75}
            aria-hidden
          />
        )}
        {showListeningIcon && (
          <Ear
            className="size-3 shrink-0 text-text-muted"
            strokeWidth={1.75}
            aria-hidden
          />
        )}
        {showConnectingIcon && (
          <Loader2
            className="size-3 shrink-0 animate-spin text-text-muted"
            strokeWidth={1.75}
            aria-hidden
          />
        )}
        <span className="inline-flex items-baseline gap-0.5">
          <span>Ward</span>
          <span aria-hidden>·</span>
          <span className="text-[10px] text-text-muted">Designer</span>
        </span>
        <span className="sr-only">
          {showSpeakingIcon
            ? 'Speaking'
            : showListeningIcon
              ? 'Listening'
              : showConnectingIcon
                ? 'Connecting'
                : undefined}
        </span>
      </span>

      {roleLabel && (
        <span className="hidden w-fit shrink-0 rounded-full border border-border-divider px-3 py-1.5 text-[13px] text-text-muted lg:inline-flex">
          Speaking with: {roleLabel}
        </span>
      )}

      {!isConnected && (
        <button
          type="button"
          onClick={() => onTalkToMe?.()}
          disabled={isConnectingState}
          className={cn(primaryCtaClass, 'shrink-0')}
        >
          {isConnectingState ? 'Connecting' : clickToStartLabel}
        </button>
      )}
      {isConnected && onEnd && (
        <button
          type="button"
          onClick={onEnd}
          aria-label="End call"
          className={cn(primaryCtaClass, 'shrink-0 gap-2')}
        >
          <PhoneOff className="size-3.5 lg:size-4" strokeWidth={1.5} />
          <span className="hidden lg:inline">End call</span>
        </button>
      )}
    </div>
  );
}
