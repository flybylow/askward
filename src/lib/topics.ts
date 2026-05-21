/** Main sidebar chapters — `navigate_to_topic` only accepts these five ids. */
export type ChapterId =
  | 'hello'
  | 'why-open'
  | 'about-ward'
  | 'what-ive-built'
  | 'practical';

/** Visual sub-items under What I've built (not in navigate_to_topic enum). */
export type SubItemId =
  | 'voice-blockchain'
  | 'talk-to-product'
  | 'momuse'
  | 'this-agent';

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
  'hello',
  'why-open',
  'about-ward',
  'what-ive-built',
  'practical',
];

const voiceAppBeats = {
  voiceBlockchain: [
    'The first voice app I built. ElevenLabs hackathon in Ghent. We won.',
    'The case study has the full story.',
  ],
  talkToProduct: [
    'The second voice app. A repair assistant where you talk to the product itself.',
    'After about ten seconds, having a conversation with the appliance just makes sense. That is the insight I keep coming back to. Voice removes the friction of the interface.',
  ],
  momuse: [
    'The third voice app. MoMu Fashion Hackathon, Antwerp, November 2025. We built a voice-narrated 3D experience around an eighteenth-century Kasuri kimono.',
    'The garment speaks differently depending on who is asking. Designer, historian, child. Same object, three different stories.',
    'We won the Bloomsbury Fashion Central Prize.',
  ],
  thisAgent: [
    'The fourth voice app. The one you are talking to right now.',
    'Built in React, with ElevenLabs Conversational AI underneath, and a knowledge graph behind it. Designed in a few days. Iterated by speaking to it and noticing where it stumbled.',
    'The point of building this was to apply for the role using the medium of the role. A working sample, not a slide deck.',
  ],
};

const whatIveBuiltBeats = [
  ...voiceAppBeats.voiceBlockchain,
  ...voiceAppBeats.talkToProduct,
  ...voiceAppBeats.momuse,
  ...voiceAppBeats.thisAgent,
];

const whatIveBuiltSubItems: SubItem[] = [
  {
    id: 'voice-blockchain',
    label: 'Voice to blockchain',
    beatStart: 0,
  },
  {
    id: 'talk-to-product',
    label: 'Talk to the product',
    beatStart: voiceAppBeats.voiceBlockchain.length,
  },
  {
    id: 'momuse',
    label: 'MoMuse',
    beatStart:
      voiceAppBeats.voiceBlockchain.length +
      voiceAppBeats.talkToProduct.length,
  },
  {
    id: 'this-agent',
    label: 'This agent',
    beatStart:
      voiceAppBeats.voiceBlockchain.length +
      voiceAppBeats.talkToProduct.length +
      voiceAppBeats.momuse.length,
  },
];

export const NAV_CHAPTERS: Chapter[] = [
  {
    id: 'hello',
    label: 'Hello',
    beats: [
      'What I have done over my career does not fit on an A4. Especially when the same role means different things to a founder, a hiring manager, and a recruiter.',
      'So I built an AI agent that adapts. Which also happens to be the job I am applying for.',
      'Pick a chapter on the left. Or just talk to me.',
    ],
  },
  {
    id: 'why-open',
    label: 'Why Open',
    beats: [
      'The job description reads like a blueprint for what I am already building.',
      'Voice agents, deployed in real conversations, watched in production. Without anyone paying me to do it yet.',
      'My take on why AI matters now. We used to build interfaces out of buttons and forms, trying to guess what people wanted. Now we can ask them in their own language. We dig into the actual need, and give answers that sound human but are statistics underneath.',
      'Open is doing that where it matters most. When a real customer is upset on the other end of the line.',
    ],
    side_panel: {
      choices: [
        {
          label: 'What would you do in the first weeks?',
          tool: 'navigate_to_topic',
          args: { topicId: 'about-ward' },
        },
        {
          label: "What's your background?",
          tool: 'navigate_to_topic',
          args: { topicId: 'about-ward' },
        },
      ],
    },
  },
  {
    id: 'about-ward',
    label: 'About Ward',
    beats: [
      'First I want to understand what is already there. Some desk research. Time inside the platform. Conversations with the people doing the job today.',
      'Then I get those people in one room. Business, tech, customer service. We surface what each side knows. The goal is to find a shared language.',
      'Out of that comes a shared vision. A north star everyone can point to.',
      'Then I drill down. From the big picture into details. I make a rough draft. A wireframe. Something concrete enough that people can react to it. We test it. If we are heading the wrong way, more co-creation. If we are right, we refine.',
      'Then we ship. Watch how customers actually use it. Refine again.',
      'I can do most of this in Dutch, French, English, or some Spanish.',
      'Mixed media art, then human-computer interaction.',
      'The art training is where I learned to think in materials and composition. The HCI degree is where that became a discipline.',
      'Since then I kept learning. Augmented reality. Data science. Machine learning. Voice. Dozens of courses. But the real learning came from sitting next to data scientists at a machine learning startup five years ago, and watching what happened to AI after that.',
      'Voice agents of this quality are a recent phenomenon. They bring new opportunities. I am adapting to the medium as it forms. Gathering insights on every project I work on.',
      'I have worked across manufacturing, fashion, payments, government, social workplaces. Different industries, same job.',
      'The job is sitting between the product and the person using it. Watching what works, what does not, and translating between them.',
      'The medium changed. Desktop, mobile, augmented reality, AI. The job did not.',
      'What I measure myself by is not the hours I put in. It is what changed in the real world because the work happened.',
      'Five years ago I worked at a machine learning startup. Six months sitting next to data scientists.',
      'That is where I saw, for the first time, how fast this medium was moving. The models were doing things that would have been research papers a year earlier.',
      'I did not see the LLM wave coming. I do not think most people did. But I had a closer view than most by the time it arrived.',
      'At ArcelorMittal I built the interface for a machine learning application that optimized production.',
      'I made it human in the loop. So it became a tool for the operators, not a replacement for their job.',
      'There was one operator who was very critical at the start. After two months in production, I interviewed him about the application. He told me it was his new friend. I asked why. He said it helped him organize his work every day, so his inspections were better now that he had time for them.',
      'That is what I am trying to do across every project. Not replace people. Free them to do the part that matters.',
      'I work with AI daily. Mostly through Claude, with a knowledge graph I built around it. I use Wispr Flow to dictate instead of typing, because it is faster and lets me think out loud.',
      'I have tested a few voice agent frameworks before settling on ElevenLabs. The devil is in the details. ElevenLabs gets closest to how a human actually sounds, and the framework around it is solid enough to build real things on.',
      'I have also experimented with hosting local AI models like Mistral, and adding guardrails on top. I have not tuned weights myself. That is a layer I am looking forward to learning from data scientists.',
      'I am also doing research at an early-phase startup. Digital product passports for circular economy.',
    ],
    side_panel: {
      prompts: [
        'Tell me about a concrete case — ask about a specific industry or project.',
      ],
    },
  },
  {
    id: 'what-ive-built',
    label: "What I've built",
    beats: whatIveBuiltBeats,
    sub_items: whatIveBuiltSubItems,
    side_panel: {
      links: [
        {
          label: 'YouTube — Voice to blockchain',
          url: 'https://www.youtube.com/watch?v=zgrckrKRArU',
        },
        { label: 'Live demo — Talk to the product', url: 'https://talk-to-product.vercel.app/' },
        { label: 'Case study — MoMuse', url: 'https://momuse.vercel.app/' },
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
      'Belgium. Two teenagers at home, so I am not relocating.',
      'I have shipped real work with people I have never met in person. Remote is normal now.',
      'Open to travel when it matters. Getting stakeholders in one room beats six video calls.',
      'Available on a short timeframe.',
      'Anything I have not covered. Ask me anything.',
      'If I do not know the answer, I will say so. I can put you in touch with Ward directly.',
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
  'quick-hello': 'hello',
  hello: 'hello',
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
  'talk-to-product': 'what-ive-built',
  momuse: 'what-ive-built',
  'this-agent': 'what-ive-built',
};

export function resolveChapterId(value: unknown): ChapterId | null {
  if (typeof value !== 'string') return null;
  if (CHAPTER_IDS.includes(value as ChapterId)) return value as ChapterId;
  return LEGACY_TOPIC_TO_CHAPTER[value] ?? null;
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
