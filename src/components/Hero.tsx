'use client';

import Image from 'next/image';
import type { CSSProperties } from 'react';

/** Portrait collage — 571×1024 (9:16) */
const COLLAGE_WIDTH = 571;
const COLLAGE_HEIGHT = 1024;

/** Wax seal overlay — edit placement here; text + collage are unchanged. */
const HERO_SEAL = {
  src: '/hero-seal.png',
  width: 669,
  height: 373,
  desktop: {
    bottom: '12%',
    left: '74%',
    width: 'min(21vw, 255px)',
  },
  mobile: {
    bottom: '10%',
    left: '76%',
    width: 'min(36vw, 158px)',
  },
} as const;

type SealPlacement = {
  left: string;
  width: string;
  top?: string;
  bottom?: string;
};

type HeroProps = {
  onTalkToMe?: () => void;
  isConnecting?: boolean;
  roleLabel?: string | null;
};

function sealStyle(placement: SealPlacement): CSSProperties {
  const style: CSSProperties = {
    left: placement.left,
    width: placement.width,
  };

  if (placement.bottom !== undefined) {
    style.bottom = placement.bottom;
    style.transform = 'translate(-50%, 0)';
  } else if (placement.top !== undefined) {
    style.top = placement.top;
    style.transform = 'translate(-50%, -50%)';
  }

  return style;
}

export function Hero({
  onTalkToMe,
  isConnecting = false,
  roleLabel = null,
}: HeroProps) {
  const handleCtaClick = () => {
    onTalkToMe?.();
    document
      .getElementById('voice-conversation')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section
      aria-label="Introduction"
      className="relative z-10 h-[85vh] overflow-visible bg-bg-base"
    >
      {/* Clips collage at hero bounds; seal sits outside this layer */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute bottom-0 right-0 hidden aspect-[571/1024] md:block"
          style={{
            height: '110%',
            maxWidth: '48vw',
          }}
        >
          <Image
            src="/hero-collage.png"
            alt=""
            width={COLLAGE_WIDTH}
            height={COLLAGE_HEIGHT}
            priority
            className="size-full object-contain object-right-bottom"
            sizes="48vw"
          />
        </div>

        <div
          className="absolute bottom-0 right-0 aspect-[571/1024] md:hidden"
          style={{
            height: '52%',
            maxWidth: '62vw',
          }}
        >
          <Image
            src="/hero-collage.png"
            alt=""
            width={COLLAGE_WIDTH}
            height={COLLAGE_HEIGHT}
            priority
            className="size-full object-contain object-right-bottom"
            sizes="62vw"
          />
        </div>
      </div>

      {/* Decorative seal — own layer; reposition via HERO_SEAL above */}
      <div
        aria-hidden
        className="pointer-events-none absolute z-20 hidden md:block"
        style={sealStyle(HERO_SEAL.desktop)}
      >
        <Image
          src={HERO_SEAL.src}
          alt=""
          width={HERO_SEAL.width}
          height={HERO_SEAL.height}
          priority
          className="size-full h-auto w-full object-contain drop-shadow-[0_8px_24px_rgba(10,10,10,0.12)]"
          sizes="255px"
        />
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute z-20 md:hidden"
        style={sealStyle(HERO_SEAL.mobile)}
      >
        <Image
          src={HERO_SEAL.src}
          alt=""
          width={HERO_SEAL.width}
          height={HERO_SEAL.height}
          priority
          className="size-full h-auto w-full object-contain drop-shadow-[0_6px_18px_rgba(10,10,10,0.1)]"
          sizes="158px"
        />
      </div>

      <div className="relative z-10 flex h-full max-w-[58%] flex-col justify-center px-6 md:pl-[10%] md:pr-6 lg:pl-[12%] lg:max-w-[54%]">
        <div className="mb-8 flex flex-wrap items-center gap-2">
          <span className="inline-flex w-fit rounded-full bg-border-divider px-3 py-1.5 text-[13px] text-text-primary">
            Ward · AI Agent Designer
          </span>
          {roleLabel && (
            <span className="inline-flex w-fit rounded-full border border-border-divider px-3 py-1.5 text-[13px] text-text-muted">
              Speaking with: {roleLabel}
            </span>
          )}
        </div>

        <h1 className="text-hero-headline text-text-primary">
          <span className="block">Designing agents</span>
          <span className="block md:whitespace-nowrap">that work out of the box.</span>
        </h1>

        <p className="mt-6 text-hero-subhead text-text-muted md:whitespace-nowrap">
          Twenty years between customers and products.
        </p>

        <button
          type="button"
          onClick={handleCtaClick}
          disabled={isConnecting}
          className="focus-ring mt-8 inline-flex w-fit items-center justify-center rounded-md bg-accent-orange px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-orange-hover disabled:cursor-wait disabled:opacity-70"
        >
          {isConnecting ? 'Connecting…' : 'Talk to me'}
        </button>
      </div>
    </section>
  );
}
