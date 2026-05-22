import { getChapter } from '@/lib/topics';
import type { ChapterId } from '@/lib/topics';
import type { DeeperCutId } from '@/lib/deeper-cuts';

/** First spoken line for deeper cuts (matches KB optional sections). */
const DEEPER_CUT_OPENING_LINE: Record<DeeperCutId, string> = {
  'momuse-deeper':
    'MoMu Fashion Hackathon, Antwerp. A voice-narrated 3D experience around an eighteenth-century Kasuri kimono.',
  'talk-to-product-deeper':
    'A repair assistant. The vacuum cleaner speaks back. You ask it what is wrong. It walks you through the fix.',
  'pawn-shop-deeper':
    'ElevenLabs hackathon in Ghent. We built a pawn shop where you can sell and inspect second hand items with AI.',
  'this-agent-deeper':
    'Built this Conversational AI with React and a knowledge graph behind it. Designed in a few days.',
};

/**
 * Replaces the ElevenLabs dashboard First message on connect.
 * Full chapter arc (all beats) unless a welcome-page deeper cut picked one opener line.
 * Requires agent Security → enable First message override.
 */
export function buildConnectFirstMessageOverride(
  chapterId: ChapterId,
  deeperCutId: string | null
): string {
  if (deeperCutId && deeperCutId in DEEPER_CUT_OPENING_LINE) {
    return DEEPER_CUT_OPENING_LINE[deeperCutId as DeeperCutId];
  }
  const beats = getChapter(chapterId)?.beats ?? [];
  if (beats.length === 0) return ' ';
  return beats.join('\n\n');
}

/** Post-connect [nav] only when the first message was a single deeper-cut opener. */
export function shouldSendConnectNavAfterFirstMessage(
  deeperCutId: string | null
): boolean {
  return Boolean(deeperCutId);
}

/** Whether the post-connect [nav] should treat the opening as already spoken. */
export function connectNavOpeningAlreadyPlayed(
  _chapterId: ChapterId,
  deeperCutId: string | null
): boolean {
  return true;
}
