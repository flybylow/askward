import type { ChapterId } from '@/lib/topics';
import { getChapter } from '@/lib/topics';

/** Machine-readable sidebar navigation — hidden from transcript. */
export const CHAPTER_NAV_PREFIX = '[nav]';

export function isChapterNavMessage(text: string): boolean {
  return text.trimStart().startsWith(CHAPTER_NAV_PREFIX);
}

/**
 * User message that triggers the agent to enter a chapter.
 * `openingAlreadyPlayed`: orb greeting or first-message override already happened.
 */
export function buildChapterNavMessage(
  id: ChapterId,
  openingAlreadyPlayed: boolean
): string {
  const label = getChapter(id)?.label ?? id;

  if (openingAlreadyPlayed) {
    return `${CHAPTER_NAV_PREFIX} chapter=${id} label="${label}" opening_played=1 action=navigate_and_speak_chapter_only forbid=hey_im_ward forbid=pick_a_chapter forbid=first_message_script`;
  }

  if (id === 'hello') {
    return `${CHAPTER_NAV_PREFIX} chapter=hello label="${label}" opening_played=0 action=navigate_then_hello_chapter`;
  }

  return `${CHAPTER_NAV_PREFIX} chapter=${id} label="${label}" opening_played=0 action=navigate_then_chapter forbid=generic_opening_greeting`;
}
