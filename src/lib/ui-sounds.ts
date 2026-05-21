/**
 * UI sound effects — wire when Ward provides sample files.
 * Calls are no-ops until assets exist.
 */

export type UiSoundId =
  | 'chapterClick'
  | 'panelOpen'
  | 'panelClose'
  | 'beatTick'
  | 'orbState';

const SOUND_PATHS: Partial<Record<UiSoundId, string>> = {
  // chapterClick: '/sounds/click.mp3',
  // panelOpen: '/sounds/whoosh-open.mp3',
  // panelClose: '/sounds/whoosh-close.mp3',
};

let muted = false;

export function setUiSoundsMuted(value: boolean) {
  muted = value;
}

export function playUiSound(id: UiSoundId) {
  if (muted || typeof window === 'undefined') return;
  const src = SOUND_PATHS[id];
  if (!src) return;
  try {
    const audio = new Audio(src);
    audio.volume = 0.15;
    void audio.play();
  } catch {
    /* ignore */
  }
}
