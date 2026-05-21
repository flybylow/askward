export type AudioEventAlignment = {
  chars: string[];
  char_start_times_ms: number[];
  char_durations_ms: number[];
};

export type BeatBoundary = {
  beatIndex: number;
  charIndex: number;
  startMs: number;
};

/** ~45 words — one interruptible spoken chunk. */
export const MAX_BEAT_CHARS = 280;

/** Split on `\n\n`, then break long paragraphs on sentence boundaries. */
export function splitBeats(text: string): string[] {
  const normalized = text.replace(/\r\n/g, '\n').trim();
  if (!normalized) return [];

  const paragraphs = normalized
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const beats: string[] = [];
  for (const paragraph of paragraphs.length > 0 ? paragraphs : [normalized]) {
    if (paragraph.length <= MAX_BEAT_CHARS) {
      beats.push(paragraph);
    } else {
      beats.push(...splitLongParagraph(paragraph));
    }
  }

  return beats.length > 0 ? beats : [normalized];
}

function splitLongParagraph(paragraph: string): string[] {
  const sentences = paragraph.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [paragraph];
  const chunks: string[] = [];
  let current = '';

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;
    const next = current ? `${current} ${trimmed}` : trimmed;
    if (next.length <= MAX_BEAT_CHARS) {
      current = next;
    } else {
      if (current) chunks.push(current);
      if (trimmed.length <= MAX_BEAT_CHARS) {
        current = trimmed;
      } else {
        chunks.push(trimmed);
        current = '';
      }
    }
  }
  if (current) chunks.push(current);
  return chunks.length > 0 ? chunks : [paragraph];
}

/** Character indices where each beat starts in the full response text. */
export function findBeatCharIndices(text: string, beats: string[]): number[] {
  const indices: number[] = [];
  let searchFrom = 0;
  const normalized = text.replace(/\r\n/g, '\n');

  for (const beat of beats) {
    const idx = normalized.indexOf(beat, searchFrom);
    indices.push(idx === -1 ? searchFrom : idx);
    searchFrom = (idx === -1 ? searchFrom : idx) + beat.length;
    const gap = normalized.slice(searchFrom).match(/^\s*/)?.[0]?.length ?? 0;
    searchFrom += gap;
  }

  if (indices[0] !== 0) indices[0] = 0;
  return indices;
}

/** Map alignment chars to ms offset for a character index in the spoken text. */
export function charIndexToMs(
  alignment: AudioEventAlignment,
  charIndex: number
): number {
  const { chars, char_start_times_ms } = alignment;
  if (chars.length === 0) return 0;
  let acc = 0;
  for (let i = 0; i < chars.length; i++) {
    if (acc >= charIndex) {
      return char_start_times_ms[i] ?? 0;
    }
    acc += chars[i]?.length ?? 0;
  }
  return char_start_times_ms[char_start_times_ms.length - 1] ?? 0;
}

export function alignmentCoversCharIndex(
  alignment: AudioEventAlignment,
  charIndex: number
): boolean {
  let acc = 0;
  for (const ch of alignment.chars) {
    if (acc >= charIndex) return true;
    acc += ch?.length ?? 0;
  }
  return false;
}

export function computeBeatBoundaries(
  responseText: string,
  alignment: AudioEventAlignment,
  beats?: string[]
): BeatBoundary[] {
  const beatList = beats ?? splitBeats(responseText);
  const charIndices = findBeatCharIndices(responseText, beatList);

  return beatList.map((_, beatIndex) => {
    const charIndex = charIndices[beatIndex] ?? 0;
    return {
      beatIndex,
      charIndex,
      startMs: charIndexToMs(alignment, charIndex),
    };
  });
}

/** Per-beat duration from word count (~170 wpm). */
export function perBeatFallbackBoundaries(beats: string[]): BeatBoundary[] {
  let cumulative = 0;
  return beats.map((beat, beatIndex) => {
    const boundary = {
      beatIndex,
      charIndex: 0,
      startMs: cumulative,
    };
    const words = beat.split(/\s+/).filter(Boolean).length;
    cumulative += Math.max(1200, words * 340);
    return boundary;
  });
}

/** Equal-time fallback when alignment is missing (legacy). */
export function equalTimeBeatBoundaries(
  beatCount: number,
  totalMs: number
): BeatBoundary[] {
  if (beatCount <= 0) return [];
  const step = beatCount > 1 ? totalMs / beatCount : 0;
  return Array.from({ length: beatCount }, (_, beatIndex) => ({
    beatIndex,
    charIndex: 0,
    startMs: beatIndex * step,
  }));
}

export type BeatSchedulerCallbacks = {
  onRevealBeat: (beatIndex: number, text: string) => void;
  onComplete?: () => void;
};

export type BeatScheduleOptions = {
  /** Skip revealing beats with index less than this (already on screen). */
  fromBeatIndex?: number;
  /** Ms already elapsed since audio / turn start (ElevenLabs alignment is from t=0). */
  elapsedMs?: number;
};

export class BeatScheduler {
  private timers: ReturnType<typeof setTimeout>[] = [];
  private cancelled = false;

  schedule(
    beats: string[],
    boundaries: BeatBoundary[],
    callbacks: BeatSchedulerCallbacks,
    options: BeatScheduleOptions = {}
  ) {
    this.cancel();
    this.cancelled = false;

    if (beats.length === 0) return;

    const fromBeat = options.fromBeatIndex ?? 0;
    const elapsed = options.elapsedMs ?? 0;
    const anchorMs = boundaries[0]?.startMs ?? 0;

    if (fromBeat === 0) {
      callbacks.onRevealBeat(0, beats[0] ?? '');
    }

    for (let i = Math.max(1, fromBeat); i < beats.length; i++) {
      const targetMs = boundaries[i]?.startMs ?? boundaries[i - 1]?.startMs ?? 0;
      const delay = Math.max(0, targetMs - anchorMs - elapsed);
      const timer = setTimeout(() => {
        if (this.cancelled) return;
        callbacks.onRevealBeat(i, beats[i] ?? '');
        if (i === beats.length - 1) callbacks.onComplete?.();
      }, delay);
      this.timers.push(timer);
    }

    if (beats.length === 1 || fromBeat >= beats.length - 1) {
      callbacks.onComplete?.();
    }
  }

  cancel() {
    this.cancelled = true;
    this.timers.forEach(clearTimeout);
    this.timers = [];
  }
}
