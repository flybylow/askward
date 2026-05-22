import { isChapterNavMessage } from '@/lib/chapter-nav';

/** ElevenLabs dashboard "First message" / generic session opener. */
export function isGenericOpeningGreeting(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (/\bpick any chapter\b/i.test(t)) return true;
  if (/\bjust ask me what you want to know\b/i.test(t)) return true;
  if (/\bi built this voice agent to apply\b/i.test(t)) return true;
  if (
    /^hey,?\s+i['']?m ward\b/i.test(t) &&
    /\bpick any chapter\b/i.test(t)
  ) {
    return true;
  }
  return false;
}

/** Short dashboard opener fragment (often arrives before pick-a-chapter line). */
export function isDashboardOpeningFragment(text: string): boolean {
  const t = text.trim();
  return /^hey,?\s+i['']?m ward\.?$/i.test(t) || /^hi,?\s+i['']?m ward\.?$/i.test(t);
}

/** Strip model text that mimics tool XML (tools not wired in ElevenLabs). */
export function stripToolCallMarkup(text: string): string {
  return text
    .replace(/<function_calls>[\s\S]*?<\/function_calls>/gi, '')
    .replace(/<invoke[\s\S]*?<\/invoke>/gi, '')
    .replace(/^\s*I\s*$/i, '')
    .trim();
}

/** ElevenLabs / STT placeholders — not real user speech. */
function isTranscriptPlaceholder(text: string): boolean {
  const t = text.trim();
  return (
    /^\.{1,3}$/.test(t) ||
    t === '…' ||
    /^[\s.…]+$/.test(t)
  );
}

export function shouldShowTranscriptLine(text: string): boolean {
  return (
    text.length > 0 &&
    !/^I$/i.test(text) &&
    !isTranscriptPlaceholder(text) &&
    !isChapterNavMessage(text)
  );
}
