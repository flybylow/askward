/** Main sidebar chapters — `navigate_to_topic` only accepts these five ids. */
export type ChapterId =
  | 'intro'
  | 'why-open'
  | 'about-ward'
  | 'what-ive-built'
  | 'practical';

/** Visual sub-items under What I've built (not in navigate_to_topic enum). */
export type SubItemId =
  | 'momuse'
  | 'talk-to-product'
  | 'pawn-shop'
  | 'this-agent';

export const SUB_ITEM_IDS: SubItemId[] = [
  'momuse',
  'talk-to-product',
  'pawn-shop',
  'this-agent',
];

export type SidePanelChoice = {
  label: string;
  tool: string;
  args?: Record<string, unknown>;
};

export type ChapterSidePanel = {
  links?: { label: string; url: string }[];
  choices?: SidePanelChoice[];
  prompts?: string[];
};

export type SubItem = {
  id: SubItemId;
  label: string;
  /** Index of the first beat in the parent chapter for in-chapter jump. */
  beatStart: number;
};

export type Chapter = {
  id: ChapterId;
  label: string;
  beats: string[];
  sub_items?: SubItem[];
  side_panel?: ChapterSidePanel;
};

export const CHAPTER_IDS: ChapterId[] = [
  'intro',
  'why-open',
  'about-ward',
  'what-ive-built',
  'practical',
];

const whatIveBuiltBeats = [
  'In the last eighteen months I built four voice apps.',
  'The first was at the MoMu Fashion Hackathon in Antwerp. A voice-narrated kimono. We won the Bloomsbury Prize.',
  'The second was a repair assistant where you talk to the product. The vacuum cleaner speaks back. After about ten seconds it just makes sense.',
  'The third was at an ElevenLabs hackathon in Ghent. Pawn Shop. We won.',
  'The fourth is the one you are talking to right now. The medium is the message.',
  'Which one do you want to hear more about?',
];

const whatIveBuiltSubItems: SubItem[] = [
  {
    id: 'momuse',
    label: 'MoMuse',
    beatStart: 1,
  },
  {
    id: 'talk-to-product',
    label: 'Talk to the product',
    beatStart: 2,
  },
  {
    id: 'pawn-shop',
    label: 'Pawn Shop',
    beatStart: 3,
  },
  {
    id: 'this-agent',
    label: 'This agent',
    beatStart: 4,
  },
];

export const NAV_CHAPTERS: Chapter[] = [
  {
    id: 'intro',
    label: 'Intro',
    beats: [
      "Hi, I'm Ward.",
      'Belgian designer, twenty years of consulting work, from startups to enterprises. Always user-focused, always technical.',
      'What I\'ve done over my career does not fit on an A4. Especially when the same role means different things to a founder, a hiring manager, and a recruiter. So I built an AI agent that adapts. Which also happens to be the job I\'m applying for.',
      'Want me to tell you why I\'m applying? Or pick any chapter on the left, or just ask me what you want to know.',
    ],
  },
  {
    id: 'why-open',
    label: 'Why Open',
    beats: [
      'I have spent decades consulting from startups to big companies. Always user-focused. Finding solutions for end users with technical means.',
      'Until a couple of years ago that meant interfaces or full design systems. Now it means AI agents.',
      'The job description reads like a blueprint for what I am already doing. We used to build interfaces out of buttons and forms, guessing what people wanted. Now we can ask in their own language. Open is doing that where it matters most. When a real customer is upset on the other end of the line.',
      'Want me to talk about how I actually work? Or move on?',
    ],
  },
  {
    id: 'about-ward',
    label: 'About Ward',
    beats: [
      'Mixed media art, then human-computer interaction. The art training is where I learned to think in materials. The HCI degree is where it became a discipline.',
      'Since then I kept learning. Augmented reality. Data science. Voice. Dozens of courses.',
      'I have worked across manufacturing, fashion, payments, government, social workplaces. Different industries, same job. Sitting between the product and the person using it.',
      'I have a story from ArcelorMittal about an operator who called the AI his new friend. Want to hear it?',
    ],
  },
  {
    id: 'what-ive-built',
    label: "What I've built",
    beats: whatIveBuiltBeats,
    sub_items: whatIveBuiltSubItems,
    side_panel: {
      links: [
        { label: 'Case study — MoMuse', url: 'https://momuse.vercel.app/' },
        { label: 'Live demo — Talk to the product', url: 'https://talk-to-product.vercel.app/' },
        {
          label: 'YouTube — Pawn Shop',
          url: 'https://www.youtube.com/watch?v=zgrckrKRArU',
        },
        {
          label: 'GitHub — This agent',
          url: 'https://github.com/flybylow/ask-ward',
        },
      ],
    },
  },
  {
    id: 'practical',
    label: 'Practical',
    beats: [
      'Belgium. Two teenagers at home, so I am not relocating. Open to travel when it matters.',
      'I can work in Dutch, French, English, or some Spanish. Wherever your customers are.',
      'Available on a short timeframe. Anything I have not covered, just ask. If I do not know the answer, I will put you in touch with Ward directly.',
    ],
    side_panel: {
      choices: [
        {
          label: 'Connect to Ward on WhatsApp',
          tool: 'connect_to_ward',
        },
      ],
    },
  },
];

const CHAPTERS_BY_ID: Record<ChapterId, Chapter> = Object.fromEntries(
  NAV_CHAPTERS.map((c) => [c.id, c])
) as Record<ChapterId, Chapter>;

/** Map legacy agent topic ids to the five chapters. */
export const LEGACY_TOPIC_TO_CHAPTER: Record<string, ChapterId> = {
  'quick-hello': 'intro',
  hello: 'intro',
  intro: 'intro',
  methodology: 'about-ward',
  education: 'about-ward',
  'looking-back': 'about-ward',
  'ai-earlier': 'about-ward',
  'ai-current': 'about-ward',
  arcelormittal: 'about-ward',
  'why-open': 'why-open',
  logistics: 'practical',
  'open-mic': 'practical',
  'what-ive-built': 'what-ive-built',
  'voice-blockchain': 'what-ive-built',
  'pawn-shop': 'what-ive-built',
  'talk-to-product': 'what-ive-built',
  momuse: 'what-ive-built',
  'this-agent': 'what-ive-built',
};

/** Legacy sub-item ids → current sidebar sub-item ids. */
const LEGACY_SUB_ITEM_TO_ID: Record<string, SubItemId> = {
  'voice-blockchain': 'pawn-shop',
};

export function resolveChapterId(value: unknown): ChapterId | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (CHAPTER_IDS.includes(trimmed as ChapterId)) return trimmed as ChapterId;
  return LEGACY_TOPIC_TO_CHAPTER[trimmed] ?? null;
}

const CHAPTER_LABEL_TO_ID: Record<string, ChapterId> = Object.fromEntries(
  NAV_CHAPTERS.flatMap((chapter) => [
    [chapter.label.toLowerCase(), chapter.id],
    [chapter.id, chapter.id],
  ])
) as Record<string, ChapterId>;

function normalizeChapterToken(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

function resolveChapterToken(value: unknown): ChapterId | null {
  const direct = resolveChapterId(value);
  if (direct) return direct;

  if (typeof value !== 'string') return null;
  const normalized = normalizeChapterToken(value);
  if (!normalized) return null;

  if (CHAPTER_IDS.includes(normalized as ChapterId)) {
    return normalized as ChapterId;
  }

  return (
    LEGACY_TOPIC_TO_CHAPTER[normalized] ??
    CHAPTER_LABEL_TO_ID[value.trim().toLowerCase()] ??
    CHAPTER_LABEL_TO_ID[normalized] ??
    null
  );
}

function unwrapToolParameterValue(value: unknown): unknown[] {
  if (value === null || value === undefined) return [];
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return [String(value)];
  }
  if (Array.isArray(value)) {
    return value.flatMap((entry) => unwrapToolParameterValue(entry));
  }
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const nested = [
      record.value,
      record.topicId,
      record.topic_id,
      record.chapterId,
      record.chapter_id,
      record.id,
      record.topic,
      record.chapter,
      record.name,
    ];
    return nested.flatMap((entry) => unwrapToolParameterValue(entry));
  }
  return [];
}

/**
 * Resolve chapter id from ElevenLabs `navigate_to_topic` / `highlightChapter` payloads.
 * Accepts topicId, topic_id, chapterId, labels, legacy ids, and nested { value } shapes.
 */
export function parseNavigateToolParameters(
  parameters: Record<string, unknown>
): ChapterId | null {
  return parseNavigateTarget(parameters)?.chapterId ?? null;
}

export function getChapter(id: ChapterId): Chapter | undefined {
  return CHAPTERS_BY_ID[id];
}

export function chapterReadModeText(id: ChapterId): string {
  return getChapter(id)?.beats.join('\n\n') ?? '';
}

export function chapterHasSidePanel(chapter: Chapter): boolean {
  const sp = chapter.side_panel;
  if (!sp) return false;
  return Boolean(sp.links?.length || sp.choices?.length || sp.prompts?.length);
}

export function getSubItemLabel(
  chapterId: ChapterId,
  subId: SubItemId
): string | undefined {
  return getChapter(chapterId)?.sub_items?.find((s) => s.id === subId)?.label;
}

export function getSubItem(
  chapterId: ChapterId,
  subId: SubItemId
): SubItem | undefined {
  return getChapter(chapterId)?.sub_items?.find((s) => s.id === subId);
}

export function resolveSubItemId(value: unknown): SubItemId | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (SUB_ITEM_IDS.includes(trimmed as SubItemId)) return trimmed as SubItemId;
  const normalized = normalizeChapterToken(trimmed);
  if (SUB_ITEM_IDS.includes(normalized as SubItemId)) {
    return normalized as SubItemId;
  }
  return LEGACY_SUB_ITEM_TO_ID[trimmed] ?? LEGACY_SUB_ITEM_TO_ID[normalized] ?? null;
}

export type NavigateTarget = {
  chapterId: ChapterId;
  subItemId?: SubItemId;
};

function collectNavigateCandidates(
  record: Record<string, unknown>
): string[] {
  const keys = [
    'topicId',
    'topic_id',
    'chapterId',
    'chapter_id',
    'subItemId',
    'sub_item_id',
    'subItem',
    'sub_item',
    'sectionId',
    'section_id',
    'id',
    'topic',
    'chapter',
    'name',
    'value',
  ] as const;

  const candidates: string[] = [];
  for (const key of keys) {
    for (const candidate of unwrapToolParameterValue(record[key])) {
      candidates.push(String(candidate));
    }
  }
  for (const value of Object.values(record)) {
    for (const candidate of unwrapToolParameterValue(value)) {
      candidates.push(String(candidate));
    }
  }
  return candidates;
}

/** Resolve chapter + optional What I've built sub-section from tool payloads. */
export function parseNavigateTarget(
  parameters: Record<string, unknown>
): NavigateTarget | null {
  let record = parameters;

  if (typeof record === 'string') {
    try {
      record = JSON.parse(record) as Record<string, unknown>;
    } catch {
      const subId = resolveSubItemId(record);
      if (subId) return { chapterId: 'what-ive-built', subItemId: subId };
      const chapterId = resolveChapterToken(record);
      return chapterId ? { chapterId } : null;
    }
  }

  const candidates = collectNavigateCandidates(record);

  for (const candidate of candidates) {
    const subId = resolveSubItemId(candidate);
    if (subId) return { chapterId: 'what-ive-built', subItemId: subId };
  }

  for (const candidate of candidates) {
    const chapterId = resolveChapterToken(candidate);
    if (chapterId) return { chapterId };
  }

  return null;
}

/** @deprecated Use ChapterId */
export type TopicId = ChapterId;

/** @deprecated Use CHAPTER_IDS */
export const TOPIC_IDS = CHAPTER_IDS;

/** @deprecated Use getChapter */
export const getTopic = getChapter;

/** @deprecated Use chapterReadModeText */
export const topicReadModeText = chapterReadModeText;

/** @deprecated Use chapterHasSidePanel */
export const topicHasSidePanel = chapterHasSidePanel;

/** @deprecated Use NAV_CHAPTERS */
export const NAV_TREE = NAV_CHAPTERS;
