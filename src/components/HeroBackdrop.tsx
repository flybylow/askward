'use client';

import Image from 'next/image';
import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils';

/** Portrait collage — 571×1024 (9:16) */
const COLLAGE_WIDTH = 571;
const COLLAGE_HEIGHT = 1024;

/** Wax seal overlay — edit placement here. */
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

type HeroBackdropProps = {
  className?: string;
  /** Slight scale when conversation is active. */
  active?: boolean;
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

/** Original hero portrait + wax seal — persistent background behind the voice collage. */
export function HeroBackdrop({ className, active = false }: HeroBackdropProps) {
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none overflow-visible', className)}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div
          data-layer="collage"
          className={cn(
            'hero-layer-collage absolute bottom-0 right-0 hidden aspect-[571/1024] transition-transform duration-700 ease-out md:block',
            active && 'scale-[1.02]'
          )}
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
          data-layer="collage"
          className={cn(
            'hero-layer-collage absolute bottom-0 right-0 aspect-[571/1024] transition-transform duration-700 ease-out md:hidden',
            active && 'scale-[1.02]'
          )}
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

      <div
        data-layer="seal"
        className={cn(
          'hero-layer-seal absolute z-20 hidden transition-transform duration-700 ease-out md:block',
          active && '-translate-y-1 scale-105'
        )}
        style={sealStyle(HERO_SEAL.desktop)}
      >
        <Image
          src={HERO_SEAL.src}
          alt=""
          width={HERO_SEAL.width}
          height={HERO_SEAL.height}
          className="size-full h-auto w-full object-contain drop-shadow-[0_8px_24px_rgba(10,10,10,0.12)]"
          sizes="255px"
        />
      </div>

      <div
        data-layer="seal"
        className={cn(
          'hero-layer-seal absolute z-20 transition-transform duration-700 ease-out md:hidden',
          active && '-translate-y-1 scale-105'
        )}
        style={sealStyle(HERO_SEAL.mobile)}
      >
        <Image
          src={HERO_SEAL.src}
          alt=""
          width={HERO_SEAL.width}
          height={HERO_SEAL.height}
          className="size-full h-auto w-full object-contain drop-shadow-[0_6px_18px_rgba(10,10,10,0.1)]"
          sizes="158px"
        />
      </div>
    </div>
  );
}
