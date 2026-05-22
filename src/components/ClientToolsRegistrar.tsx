'use client';

import { useEffect, useRef } from 'react';
import { useConversationClientTool } from '@elevenlabs/react';
import type { ChapterId, ListenerRole } from '@/lib/client-tools';
import type { SubItemId } from '@/lib/topics';
import { parseNavigateTarget } from '@/lib/topics';
import {
  debugNav,
  type NavDebugToolEvent,
  type NavDebugToolPhase,
} from '@/lib/debug-nav';

const REGISTERED_TOOLS = [
  'navigate_to_topic',
  'highlightChapter',
  'set_role',
  'connect_to_ward',
  'open_side_panel',
  'showCVDownload',
  'switchToReadMode',
] as const;

type ClientToolsRegistrarProps = {
  selectChapter: (id: ChapterId, source: 'ui' | 'tool') => void;
  selectSubItem: (id: SubItemId, source: 'ui' | 'tool') => void;
  setCvVisible: (visible: boolean) => void;
  setReadMode: (on: boolean) => void;
  setRole: (role: ListenerRole) => void;
  openSidePanel: () => void;
  connectToWard: () => void;
  onToolDebug?: (event: NavDebugToolEvent) => void;
};

function reportToolPhase(
  onToolDebug: ClientToolsRegistrarProps['onToolDebug'],
  name: string,
  phase: NavDebugToolPhase,
  extra?: Partial<NavDebugToolEvent>
) {
  onToolDebug?.({
    name,
    phase,
    at: Date.now(),
    ...extra,
  });
}

function applyNavigateTarget(
  target: ReturnType<typeof parseNavigateTarget>,
  selectChapter: ClientToolsRegistrarProps['selectChapter'],
  selectSubItem: ClientToolsRegistrarProps['selectSubItem']
) {
  if (!target) return false;
  if (target.subItemId) {
    selectSubItem(target.subItemId, 'tool');
  } else {
    selectChapter(target.chapterId, 'tool');
  }
  return true;
}

export function ClientToolsRegistrar({
  selectChapter,
  selectSubItem,
  setCvVisible,
  setReadMode,
  setRole,
  openSidePanel,
  connectToWard,
  onToolDebug,
}: ClientToolsRegistrarProps) {
  const selectChapterRef = useRef(selectChapter);
  const selectSubItemRef = useRef(selectSubItem);
  const setCvVisibleRef = useRef(setCvVisible);
  const setReadModeRef = useRef(setReadMode);
  const setRoleRef = useRef(setRole);
  const openSidePanelRef = useRef(openSidePanel);
  const connectToWardRef = useRef(connectToWard);
  const onToolDebugRef = useRef(onToolDebug);

  selectChapterRef.current = selectChapter;
  selectSubItemRef.current = selectSubItem;
  setCvVisibleRef.current = setCvVisible;
  setReadModeRef.current = setReadMode;
  setRoleRef.current = setRole;
  openSidePanelRef.current = openSidePanel;
  connectToWardRef.current = connectToWard;
  onToolDebugRef.current = onToolDebug;

  useEffect(() => {
    debugNav('tools.registered', { tools: [...REGISTERED_TOOLS] });
  }, []);

  const wrapTool = (
    name: string,
    handler: (parameters: Record<string, unknown>) => string
  ) => {
    return (parameters: Record<string, unknown>) => {
      debugNav('tool.invoke.start', { name, parameters });
      reportToolPhase(onToolDebugRef.current, name, 'running', { parameters });
      try {
        const result = handler(parameters);
        debugNav('tool.invoke.done', { name, result });
        reportToolPhase(onToolDebugRef.current, name, 'done', {
          parameters,
          result,
        });
        return result;
      } catch (err) {
        const error = err instanceof Error ? err.message : String(err);
        debugNav('tool.invoke.error', { name, error });
        reportToolPhase(onToolDebugRef.current, name, 'error', {
          parameters,
          error,
        });
        throw err;
      }
    };
  };

  const handleNavigate = wrapTool('navigate_to_topic', (parameters) => {
    const target = parseNavigateTarget(parameters);

    debugNav('tool.navigate.resolve', {
      parameters,
      parameterKeys: Object.keys(parameters),
      resolvedTarget: target,
    });

    const applied = applyNavigateTarget(
      target,
      selectChapterRef.current,
      selectSubItemRef.current
    );

    if (!applied) {
      debugNav('tool.navigate.unresolved', {
        parameters,
        hint: 'ElevenLabs tool must send topicId (e.g. what-ive-built or intro). Check Agent → Tools → navigate_to_topic parameter name.',
      });
    }

    if (target && target.chapterId !== 'intro') {
      return 'OK. Do not repeat Hey I am Ward or the first-message script. Speak only this chapter knowledge-base content now.';
    }
    return target ? 'Chapter navigated' : 'Chapter id not recognized on client';
  });

  useConversationClientTool('navigate_to_topic', handleNavigate);
  useConversationClientTool(
    'highlightChapter',
    wrapTool('highlightChapter', (parameters) => {
      const target = parseNavigateTarget(parameters);
      debugNav('tool.highlightChapter.resolve', {
        parameters,
        parameterKeys: Object.keys(parameters),
        resolvedTarget: target,
      });
      const applied = applyNavigateTarget(
        target,
        selectChapterRef.current,
        selectSubItemRef.current
      );
      return applied ? 'Chapter navigated' : 'Chapter id not recognized on client';
    })
  );

  useConversationClientTool(
    'set_role',
    wrapTool('set_role', (parameters) => {
      const role = parameters.role as ListenerRole;
      if (
        role === 'founder' ||
        role === 'hiring_manager' ||
        role === 'recruiter'
      ) {
        setRoleRef.current(role);
        debugNav('tool.set_role.applied', { role });
      } else {
        debugNav('tool.set_role.skipped', { role: parameters.role });
      }
      return 'Role set';
    })
  );

  useConversationClientTool(
    'connect_to_ward',
    wrapTool('connect_to_ward', () => {
      connectToWardRef.current();
      return 'WhatsApp overlay opened';
    })
  );

  useConversationClientTool(
    'open_side_panel',
    wrapTool('open_side_panel', () => {
      openSidePanelRef.current();
      return 'Side panel opened';
    })
  );

  useConversationClientTool(
    'showCVDownload',
    wrapTool('showCVDownload', () => {
      setCvVisibleRef.current(true);
      return 'CV download surfaced';
    })
  );

  useConversationClientTool(
    'switchToReadMode',
    wrapTool('switchToReadMode', () => {
      setReadModeRef.current(true);
      return 'Switched to read mode';
    })
  );

  return null;
}

export { REGISTERED_TOOLS };
