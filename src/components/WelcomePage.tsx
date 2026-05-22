'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { ChapterId, SubItemId } from '@/lib/topics';
import { WELCOME_CARDS, type WelcomeCard, type WelcomeSubItem } from '@/lib/welcome-cards';

type WelcomePageProps = {
  onActivate: (chapterId: ChapterId, subItemId?: SubItemId) => void;
  isConnecting?: boolean;
  className?: string;
};

const CHAPTER_ROW_CARDS = WELCOME_CARDS.filter((c) => !c.sub_items);
const BUILT_CARD = WELCOME_CARDS.find((c) => c.chapterId === 'what-ive-built');

function SubItemThumbnail({ item }: { item: WelcomeSubItem }) {
  const [failed, setFailed] = useState(false);
  const showImage = item.thumbnailSrc && !failed;

  return (
    <div className="welcome-card__thumb h-20 w-full shrink-0 overflow-hidden rounded">
      {showImage ? (
        <Image
          src={item.thumbnailSrc!}
          alt={item.label}
          width={160}
          height={80}
          className="h-full w-full object-contain object-center"
          onError={() => setFailed(true)}
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center px-2 text-center text-[10px] text-text-muted"
          aria-hidden
        >
          {item.label}
        </div>
      )}
    </div>
  );
}

function SimpleCard({
  card,
  onActivate,
}: {
  card: WelcomeCard;
  onActivate: (chapterId: ChapterId) => void;
}) {
  return (
    <article role="listitem" className="welcome-card">
      <button
        type="button"
        onClick={() => onActivate(card.chapterId)}
        className="welcome-card__main welcome-card__main--full focus-ring"
      >
        <span className="welcome-card__label">{card.label}</span>
        <span className="welcome-card__desc">{card.description}</span>
      </button>
    </article>
  );
}

export function WelcomePage({
  onActivate,
  isConnecting = false,
  className,
}: WelcomePageProps) {
  return (
    <div className={cn('welcome-page', className)}>
      <header className="welcome-page__hero">
        <h1 className="welcome-page__headline">
          Designing agents that work out of the box.
        </h1>
        <p className="welcome-page__subhead">
          Twenty years between customers and products.
        </p>
      </header>

      <div className="welcome-page__cards" role="list">
        <div className="welcome-page__row" role="presentation">
          {CHAPTER_ROW_CARDS.map((card) => (
            <SimpleCard
              key={card.chapterId}
              card={card}
              onActivate={(id) => onActivate(id)}
            />
          ))}
        </div>

        {BUILT_CARD?.sub_items && (
          <article role="listitem" className="welcome-card welcome-card--built">
            <button
              type="button"
              onClick={() => onActivate(BUILT_CARD.chapterId)}
              className="welcome-card__main focus-ring"
            >
              <span className="welcome-card__label">{BUILT_CARD.label}</span>
              <span className="welcome-card__desc">{BUILT_CARD.description}</span>
            </button>
            <ul className="welcome-card__subs">
              {BUILT_CARD.sub_items.map((sub) => (
                <li key={sub.id} className="welcome-card__sub-item">
                  <button
                    type="button"
                    onClick={() => onActivate('what-ive-built', sub.id)}
                    className="welcome-card__sub focus-ring"
                  >
                    <SubItemThumbnail item={sub} />
                    <span className="welcome-card__sub-label">{sub.label}</span>
                  </button>
                  <a
                    href={sub.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="welcome-card__project-link focus-ring"
                  >
                    Open project
                  </a>
                </li>
              ))}
            </ul>
          </article>
        )}
      </div>

      <div className="welcome-page__cta">
        <button
          type="button"
          onClick={() => onActivate('intro')}
          disabled={isConnecting}
          className="welcome-page__cta-button focus-ring"
        >
          {isConnecting ? 'Connecting…' : 'Talk to me'}
        </button>
      </div>
    </div>
  );
}
