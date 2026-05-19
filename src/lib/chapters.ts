import type { ChapterId } from './client-tools';

export type Chapter = {
  id: ChapterId;
  label: string;
  oneLiner: string;
  readModeText: string;
};

export const CHAPTERS: Chapter[] = [
  {
    id: 'intro',
    label: '1. Quick hello',
    oneLiner: 'Who I am, in 20 seconds.',
    readModeText:
      "Hi, I'm Ward. I'm a Belgian product designer who, over the last 18 months, has become an AI builder. I founded Tabulas, a circular economy startup, in 2025. I've shipped voice agents, won an AI hackathon for a museum companion, and learned to code in React along the way. I'm applying to Open because the Agent Designer role is exactly what I do every week, and I want to do it full-time at scale.",
  },
  {
    id: 'agent-experience',
    label: '2. Voice & AI work',
    oneLiner: "What I've shipped: VacuumPro V8, MoMuse, voice-to-blockchain.",
    readModeText:
      "I've shipped voice agents and AI products in the last year. The biggest one is VacuumPro V8 — talk-to-product.vercel.app. It's a voice-enabled digital product passport for a vacuum cleaner. You scan it, you talk to it, it tells you about its materials, its repair guide, its origin. Built on ElevenLabs Conversational AI. I've also built an AI museum companion that won a prize at MoMu, and prototyped a voice agent that talks to a blockchain wallet.",
  },
  {
    id: 'why-open',
    label: '3. Why Open',
    oneLiner: 'Why this role, why now.',
    readModeText:
      "Three reasons. One, the Agent Designer JD describes what I already do every week: design behavior, write prompts, set up tools, run experiments. Two, Open is doing it at a scale I can't reach alone — MoneyGram, Mollie, real enterprise traffic. I learn fastest when the stakes are real. Three, this is the right team timing. YC W24, $8M raised, customer-facing role from Europe. I'd be useful from week one.",
  },
  {
    id: 'tabulas-deep',
    label: '4. About Tabulas',
    oneLiner: 'One minute on the startup, mostly what I learned.',
    readModeText:
      "Tabulas is a circular economy startup I founded in 2025. We help products carry verified information across their lifecycle, mostly in construction. But I'd rather tell you what I learned building it than pitch it. In 18 months I went from designing UIs in Figma to writing TypeScript, querying knowledge graphs, building voice agents, and integrating blockchain attestations. Tabulas is the proof that I can take an idea from zero to shipped without waiting for permission.",
  },
  {
    id: 'customer-facing',
    label: '5. Stakeholder work',
    oneLiner: 'Customer conversations, hackathon pitches, teaching.',
    readModeText:
      "25 years of product design means 25 years of being in rooms with people who don't know what they want. At Capgemini I led design for ArcelorMittal's enterprise steel platform. At Sweet Mustard I designed a manufacturing system for Electrolux across 30+ sites. As a founder, I do BD calls, hackathon pitches, and peer teaching at Ghent University. Talking to customers and translating their problem into a product is the work I've been doing the longest.",
  },
  {
    id: 'prompt-engineering',
    label: '6. Prompts & evals',
    oneLiner: 'How I think about agent design.',
    readModeText:
      'Three rules I work by. One, the system prompt should describe the agent\'s job, not its personality. Personality emerges from constraints. Two, every prompt needs explicit fallbacks for off-topic, unknown, and edge cases. Mine usually has at least 5 of those. Three, response length is a feature, not an afterthought. Voice agents that exceed 30 seconds per turn lose the user. For the VacuumPro V8 I cap responses at 50 words and the assistant routinely sounds smarter for it.',
  },
  {
    id: 'design-history',
    label: '7. 25 years, reframed',
    oneLiner: 'Why my design background is prompt engineering in disguise.',
    readModeText:
      "The summary is: I've spent 25 years making complex technical systems accessible to non-experts. That is literally the job of an agent designer. Examples: enterprise steel manufacturing at ArcelorMittal, a government healthcare platform that had failed twice before I was brought in, a wine investment DeFi protocol, a Bitcoin exchange. The pattern is the same: someone built something powerful and confusing, and my job is to make a human able to use it. That's prompt engineering in a different uniform.",
  },
  {
    id: 'logistics',
    label: '8. Logistics',
    oneLiner: 'Location, work auth, availability.',
    readModeText:
      "I'm in Bruges, Belgium. EU citizen, no visa or sponsorship needed. The role is listed as remote EU, which fits. I can start within a notice period I'd want to discuss with a human. On comp, the JD says top-of-market and I'd want to discuss that with a human too. Email: warddem@gmail.com. Phone: +32 471 35 31 04.",
  },
  {
    id: 'ask-anything',
    label: '9. Ask anything',
    oneLiner: 'No script. Just ask.',
    readModeText:
      'No script — start a conversation and ask whatever you want.',
  },
];
