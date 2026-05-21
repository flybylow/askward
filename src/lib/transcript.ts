import { isChapterNavMessage } from '@/lib/chapter-nav';

/** Strip model text that mimics tool XML (tools not wired in ElevenLabs). */
export function stripToolCallMarkup(text: string): string {
  return text
    .replace(/<function_calls>[\s\S]*?<\/function_calls>/gi, '')
    .replace(/<invoke[\s\S]*?<\/invoke>/gi, '')
    .replace(/^\s*I\s*$/i, '')
    .trim();
}

export function shouldShowTranscriptLine(text: string): boolean {
  return (
    text.length > 0 &&
    !/^I$/i.test(text) &&
    !isChapterNavMessage(text)
  );
}
