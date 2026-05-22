'use client';

import { useEffect, useRef } from 'react';
import { useConversationClientTool } from '@elevenlabs/react';
import type { ChapterId, ListenerRole } from '@/lib/client-tools';
import type { SubItemId } from '@/lib/topics';
import { parseNavigateTarget } from '@/lib/topics';
import {
  isDeeperCutId,
  subItemFromDeeperCutId,
} from '@/lib/deeper-cuts';
import {
  debugNav,
  type NavDebugToolEvent,
  type NavDebugToolPhase,
} from '@/lib/debug-nav';

const REGISTERED_TOOLS = [
  'navigate_to_topic',
  'show_deeper_cut',
  'highlightChapter',
  'set_role',
  'connect_to_ward',
  'switchToReadMode',
] as const;

type ClientToolsRegistrarProps = {
  selectChapter: (id: ChapterId, source: 'ui' | 'tool') => void;
  selectSubItem: (id: SubItemId, source: 'ui' | 'tool') => void;
  setReadMode: (on: boolean) => void;
  setRole: (role: ListenerRole) => void;
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
  setReadMode,
  setRole,
  connectToWard,
  onToolDebug,
}: ClientToolsRegistrarProps) {
  const selectChapterRef = useRef(selectChapter);
  const selectSubItemRef = useRef(selectSubItem);
  const setReadModeRef = useRef(setReadMode);
  const setRoleRef = useRef(setRole);
  const connectToWardRef = useRef(connectToWard);
  const onToolDebugRef = useRef(onToolDebug);

  selectChapterRef.current = selectChapter;
  selectSubItemRef.current = selectSubItem;
  setReadModeRef.current = setReadMode;
  setRoleRef.current = setRole;
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
    'show_deeper_cut',
    wrapTool('show_deeper_cut', (parameters) => {
      const raw =
        parameters.deeper_cut_id ??
        parameters.deeperCutId ??
        parameters.deeper_cut;
      const id = typeof raw === 'string' ? raw.trim() : '';
      if (!isDeeperCutId(id)) {
        debugNav('tool.show_deeper_cut.unresolved', { parameters });
        return 'Deeper cut id not recognized on client';
      }
      const subItemId = subItemFromDeeperCutId(id);
      selectChapterRef.current('what-ive-built', 'tool');
      selectSubItemRef.current(subItemId, 'tool');
      debugNav('tool.show_deeper_cut.applied', { deeperCutId: id, subItemId });
      return `Deeper cut ${id} highlighted. Speak that optional deeper cut from the knowledge base now.`;
    })
  );

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
    'switchToReadMode',
    wrapTool('switchToReadMode', () => {
      setReadModeRef.current(true);
      return 'Switched to read mode';
    })
  );

  return null;
}

export { REGISTERED_TOOLS };
