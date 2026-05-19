'use client';

import { useRef } from 'react';
import { useConversationClientTool } from '@elevenlabs/react';
import type { ChapterId } from '@/lib/client-tools';

type ClientToolsRegistrarProps = {
  setActiveChapter: (id: ChapterId) => void;
  setCvVisible: (visible: boolean) => void;
  setReadMode: (on: boolean) => void;
};

/**
 * Registers client tools with ConversationProvider (names must match ElevenLabs UI).
 */
export function ClientToolsRegistrar({
  setActiveChapter,
  setCvVisible,
  setReadMode,
}: ClientToolsRegistrarProps) {
  const setActiveChapterRef = useRef(setActiveChapter);
  const setCvVisibleRef = useRef(setCvVisible);
  const setReadModeRef = useRef(setReadMode);
  setActiveChapterRef.current = setActiveChapter;
  setCvVisibleRef.current = setCvVisible;
  setReadModeRef.current = setReadMode;

  useConversationClientTool('highlightChapter', (parameters) => {
    const chapterId = parameters.chapterId as ChapterId;
    setActiveChapterRef.current(chapterId);
    return 'Chapter highlighted';
  });

  useConversationClientTool('showCVDownload', () => {
    setCvVisibleRef.current(true);
    return 'CV download surfaced';
  });

  useConversationClientTool('switchToReadMode', () => {
    setReadModeRef.current(true);
    return 'Switched to read mode';
  });

  return null;
}
