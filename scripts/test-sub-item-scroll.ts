/**
 * Regression: sidebar sub-items must map to the correct What I've built beats.
 * Run: npm test
 */
import assert from 'node:assert/strict';
import { splitBeats } from '../src/lib/beat-sync';
import {
  findChapterBeatMessageIndex,
  findSubItemMessageIndex,
  getChapter,
  inferChapterBeatIndex,
  subItemIdForChapterBeat,
  type SubItemId,
} from '../src/lib/topics';

const CHAPTER = 'what-ive-built' as const;
const beats = getChapter(CHAPTER)!.beats;
const split = splitBeats(beats.join('\n\n'));

assert.equal(
  split.length,
  beats.length,
  `splitBeats should preserve ${beats.length} chapter beats`
);

const messages = split.map((text, i) => {
  const chapterBeatIndex = inferChapterBeatIndex(CHAPTER, text, i, split.length);
  return {
    role: 'agent' as const,
    text,
    topicId: CHAPTER,
    chapterBeatIndex,
    subItemId:
      chapterBeatIndex != null
        ? subItemIdForChapterBeat(CHAPTER, chapterBeatIndex)
        : undefined,
  };
});

const expected: Record<SubItemId, number> = {
  momuse: 1,
  'talk-to-product': 2,
  'pawn-shop': 3,
  'this-agent': 4,
};

for (const [subId, beatStart] of Object.entries(expected) as [SubItemId, number][]) {
  assert.equal(
    getChapter(CHAPTER)?.sub_items?.find((s) => s.id === subId)?.beatStart,
    beatStart,
    `${subId}: beatStart must match chapter beat index`
  );

  const idx = findSubItemMessageIndex(messages, CHAPTER, subId);
  assert.ok(idx >= 0, `${subId}: expected a transcript row`);
  assert.equal(messages[idx].subItemId, subId, `${subId}: wrong subItemId tag`);
  assert.equal(messages[idx].text, beats[beatStart], `${subId}: wrong bubble text`);

  const byBeat = findChapterBeatMessageIndex(messages, CHAPTER, beatStart);
  assert.equal(byBeat, idx, `${subId}: beat index lookup must match sub-item lookup`);
}

const intro = getChapter('intro')!.beats.map((text) => ({
  role: 'agent' as const,
  text,
  topicId: 'intro' as const,
}));
const withIntro = [...intro, ...messages];

for (const [subId, beatStart] of Object.entries(expected) as [SubItemId, number][]) {
  const idx = findSubItemMessageIndex(withIntro, CHAPTER, subId);
  assert.equal(
    withIntro[idx]?.text,
    beats[beatStart],
    `${subId}: intro prefix must not steal scroll target`
  );
}

console.log('sub-item-scroll: all assertions passed');
