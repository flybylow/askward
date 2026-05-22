'use client';

import { cn } from '@/lib/utils';
import type { OrbPhase } from '@/lib/orb-phase';
import { voiceStatusLine } from '@/components/VoiceOrb';
import { Brain, Ear, Loader2, Menu, Mic, PhoneOff, Speech } from 'lucide-react';

type HeroIntroProps = {
  navOpen?: boolean;
  onToggleNav?: () => void;
  onContact?: () => void;
  onTalkToMe?: () => void;
  isConnecting?: boolean;
  status?: 'disconnected' | 'connecting' | 'connected' | 'error';
  phase?: OrbPhase;
  onEnd?: () => void;
  errorMessage?: string;
  className?: string;
};

/** Menu toggle + badge row + CTAs. */
const navLinkClass =
  'focus-ring shrink-0 border-0 bg-transparent px-1 py-0.5 text-[13px] font-normal text-text-muted underline-offset-2 transition-colors hover:text-text-primary hover:underline';

export function HeroIntro({
  navOpen = false,
  onToggleNav,
  onContact,
  onTalkToMe,
  isConnecting = false,
  status = 'disconnected',
  phase = 'idle',
  onEnd,
  errorMessage,
  className,
}: HeroIntroProps) {
  const isConnected = status === 'connected';
  const isConnectingState = status === 'connecting' || isConnecting;
  const ctaLabel = voiceStatusLine(status, phase, errorMessage);

  const chipClass =
    'border border-border-divider/50 bg-bg-chip shadow-sm transition-colors hover:bg-bg-subtle';

  const primaryCtaClass =
    'focus-ring inline-flex w-fit items-center justify-center rounded-md bg-[var(--accent-orange)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-orange-hover)] disabled:cursor-wait disabled:opacity-70';

  const showAgentSpeaking = phase === 'agent-speaking';
  const showUserSpeaking = phase === 'user-speaking';
  const showListening = phase === 'listening';
  const showThinking = phase === 'thinking';
  const showConnectingIcon = phase === 'connecting' || isConnectingState;

  return (
    <div
      className={cn(
        'flex w-full min-w-0 flex-nowrap items-center gap-2 rounded-lg px-1 py-1',
        className
      )}
    >
      <button
        type="button"
        onClick={() => onToggleNav?.()}
        aria-expanded={navOpen}
        aria-controls="chapter-navigation"
        aria-label={navOpen ? 'Close chapter menu' : 'Open chapter menu'}
        className={cn(
          'focus-ring relative z-20 inline-flex shrink-0 items-center justify-center rounded-full px-2.5 py-1.5 text-text-primary',
          chipClass
        )}
      >
        <Menu className="size-3 shrink-0 text-text-muted" strokeWidth={1.75} />
      </button>

      <span
        className={cn(
          'inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] text-text-primary',
          chipClass
        )}
      >
        {showAgentSpeaking && (
          <Speech
            className="size-3 shrink-0 text-text-muted"
            strokeWidth={1.75}
            aria-hidden
          />
        )}
        {showUserSpeaking && (
          <Mic
            className="size-3 shrink-0 text-[var(--accent-orange)]"
            strokeWidth={1.75}
            aria-hidden
          />
        )}
        {showListening && (
          <Ear
            className="size-3 shrink-0 text-text-muted"
            strokeWidth={1.75}
            aria-hidden
          />
        )}
        {showThinking && (
          <Brain
            className="size-3 shrink-0 animate-orb-thinking text-sage"
            strokeWidth={1.75}
            aria-hidden
          />
        )}
        {showConnectingIcon && !isConnected && (
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
          {showAgentSpeaking
            ? 'Speaking'
            : showUserSpeaking
              ? 'You are speaking'
              : showListening
                ? 'Listening'
                : showThinking
                  ? 'Thinking'
                  : showConnectingIcon
                    ? 'Connecting'
                    : undefined}
        </span>
      </span>

      <button type="button" onClick={() => onContact?.()} className={navLinkClass}>
        Contact
      </button>

      <span className="min-w-2 flex-1" aria-hidden />

      {!isConnected && (
        <button
          type="button"
          onClick={() => onTalkToMe?.()}
          disabled={isConnectingState}
          className={cn(primaryCtaClass, 'shrink-0')}
        >
          {isConnectingState ? 'Connecting' : ctaLabel}
        </button>
      )}
      {isConnected && onEnd && (
        <button
          type="button"
          onClick={onEnd}
          aria-label="End call"
          className={cn(primaryCtaClass, 'shrink-0 gap-2')}
        >
          <PhoneOff className="size-4" strokeWidth={1.5} />
          <span>End call</span>
        </button>
      )}
    </div>
  );
}
