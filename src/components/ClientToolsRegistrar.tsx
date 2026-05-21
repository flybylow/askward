'use client';

import { useRef } from 'react';
import { useConversationClientTool } from '@elevenlabs/react';
import type { ChapterId, ListenerRole } from '@/lib/client-tools';
import { resolveChapterId } from '@/lib/topics';

type ClientToolsRegistrarProps = {
  selectChapter: (id: ChapterId, source: 'ui' | 'tool') => void;
  setCvVisible: (visible: boolean) => void;
  setReadMode: (on: boolean) => void;
  setRole: (role: ListenerRole) => void;
  openSidePanel: () => void;
  connectToWard: () => void;
};

export function ClientToolsRegistrar({
  selectChapter,
  setCvVisible,
  setReadMode,
  setRole,
  openSidePanel,
  connectToWard,
}: ClientToolsRegistrarProps) {
  const selectChapterRef = useRef(selectChapter);
  const setCvVisibleRef = useRef(setCvVisible);
  const setReadModeRef = useRef(setReadMode);
  const setRoleRef = useRef(setRole);
  const openSidePanelRef = useRef(openSidePanel);
  const connectToWardRef = useRef(connectToWard);

  selectChapterRef.current = selectChapter;
  setCvVisibleRef.current = setCvVisible;
  setReadModeRef.current = setReadMode;
  setRoleRef.current = setRole;
  openSidePanelRef.current = openSidePanel;
  connectToWardRef.current = connectToWard;

  const handleNavigate = (parameters: Record<string, unknown>) => {
    const id =
      resolveChapterId(parameters.topicId) ??
      resolveChapterId(parameters.chapterId);
    if (id) selectChapterRef.current(id, 'tool');
    if (id && id !== 'hello') {
      return 'OK. Do not repeat Hey I am Ward or the first-message script. Speak only this chapter knowledge-base content now.';
    }
    return 'Chapter navigated';
  };

  useConversationClientTool('navigate_to_topic', handleNavigate);
  useConversationClientTool('highlightChapter', handleNavigate);

  useConversationClientTool('set_role', (parameters) => {
    const role = parameters.role as ListenerRole;
    if (
      role === 'founder' ||
      role === 'hiring_manager' ||
      role === 'recruiter'
    ) {
      setRoleRef.current(role);
    }
    return 'Role set';
  });

  useConversationClientTool('connect_to_ward', () => {
    connectToWardRef.current();
    return 'WhatsApp panel opened';
  });

  useConversationClientTool('open_side_panel', () => {
    openSidePanelRef.current();
    return 'Side panel opened';
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
