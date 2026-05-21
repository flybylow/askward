import type { ChapterId, SubItemId } from '@/lib/topics';
import { getChapter, getSubItem } from '@/lib/topics';

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
    return `${CHAPTER_NAV_PREFIX} chapter=${id} label="${label}" opening_played=1 action=navigate_and_speak_chapter_only forbid=hey_im_ward forbid=hey_ward forbid=pick_a_chapter forbid=first_message_script forbid=generic_opening_greeting forbid=repeat_intro`;
  }

  if (id === 'hello') {
    return `${CHAPTER_NAV_PREFIX} chapter=hello label="${label}" opening_played=0 action=navigate_then_hello_chapter`;
  }

  return `${CHAPTER_NAV_PREFIX} chapter=${id} label="${label}" opening_played=0 action=navigate_then_chapter forbid=generic_opening_greeting`;
}

/** Hidden nav message for a What I've built sub-section (voice-blockchain, etc.). */
export function buildSubItemNavMessage(
  chapterId: ChapterId,
  subId: SubItemId,
  openingAlreadyPlayed: boolean
): string {
  const sub = getSubItem(chapterId, subId);
  const chapterLabel = getChapter(chapterId)?.label ?? chapterId;
  const label = sub?.label ?? subId;
  const beatStart = sub?.beatStart ?? 0;

  if (openingAlreadyPlayed) {
    return `${CHAPTER_NAV_PREFIX} chapter=${chapterId} chapter_label="${chapterLabel}" sub_item=${subId} label="${label}" beat_start=${beatStart} speak_only_from_beat=${beatStart} opening_played=1 action=navigate_and_speak_subsection_only forbid=hey_im_ward forbid=hey_ward forbid=pick_a_chapter forbid=first_message_script forbid=generic_opening_greeting forbid=repeat_intro forbid=restart_chapter_from_beat_zero forbid=earlier_voice_apps`;
  }

  return `${CHAPTER_NAV_PREFIX} chapter=${chapterId} chapter_label="${chapterLabel}" sub_item=${subId} label="${label}" beat_start=${beatStart} speak_only_from_beat=${beatStart} opening_played=0 action=navigate_then_subsection forbid=generic_opening_greeting forbid=first_message_script forbid=restart_chapter_from_beat_zero forbid=earlier_voice_apps`;
}
