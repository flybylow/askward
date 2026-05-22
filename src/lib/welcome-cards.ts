import type { ChapterId, SubItemId } from '@/lib/topics';
import { VOICE_APP_PROJECT_URLS } from '@/lib/topics';

export type WelcomeSubItem = {
  id: SubItemId;
  label: string;
  /** Optional path under /public, e.g. /thumbnails/momuse.png */
  thumbnailSrc?: string;
  /** External project link (demo, repo, video). */
  projectUrl: string;
};

export type WelcomeCard = {
  chapterId: ChapterId;
  label: string;
  description: string;
  sub_items?: WelcomeSubItem[];
};

export const WELCOME_CARDS: WelcomeCard[] = [
  {
    chapterId: 'intro',
    label: 'Intro',
    description: 'How this works',
  },
  {
    chapterId: 'why-open',
    label: 'Why Open',
    description: 'Why I want to work here',
  },
  {
    chapterId: 'about-ward',
    label: 'About Ward',
    description: 'Belgian designer, 20 years',
  },
  {
    chapterId: 'what-ive-built',
    label: "What I've built",
    description: 'Four voice apps',
    sub_items: [
      {
        id: 'momuse',
        label: 'MoMuse',
        thumbnailSrc: '/momuse.png',
        projectUrl: VOICE_APP_PROJECT_URLS.momuse,
      },
      {
        id: 'talk-to-product',
        label: 'Talk to the product',
        thumbnailSrc: '/talktoproduct.png',
        projectUrl: VOICE_APP_PROJECT_URLS['talk-to-product'],
      },
      {
        id: 'pawn-shop',
        label: 'Pawn Shop',
        thumbnailSrc: '/pawnshop.png',
        projectUrl: VOICE_APP_PROJECT_URLS['pawn-shop'],
      },
      {
        id: 'this-agent',
        label: 'This agent',
        thumbnailSrc: '/hero-collage.png',
        projectUrl: VOICE_APP_PROJECT_URLS['this-agent'],
      },
    ],
  },
  {
    chapterId: 'practical',
    label: 'Practical',
    description: 'Logistics, availability',
  },
];
