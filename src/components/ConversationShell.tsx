'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useConversation } from '@elevenlabs/react';
import {
  getChapter,
  chapterHasSidePanel,
} from '@/lib/topics';
import type { ChapterId, SubItemId } from '@/lib/topics';
import type { AudioEventAlignment } from '@/lib/beat-sync';
import type { ListenerRole } from '@/lib/client-tools';
import {
  BeatScheduler,
  alignmentCoversCharIndex,
  computeBeatBoundaries,
  findBeatCharIndices,
  perBeatFallbackBoundaries,
  splitBeats,
} from '@/lib/beat-sync';
import {
  buildChapterNavMessage,
  buildSubItemNavMessage,
  isChapterNavMessage,
} from '@/lib/chapter-nav';
import {
  shouldShowTranscriptLine,
  stripToolCallMarkup,
  isGenericOpeningGreeting,
} from '@/lib/transcript';
import { playUiSound } from '@/lib/ui-sounds';
import {
  ClientToolsRegistrar,
  REGISTERED_TOOLS,
} from '@/components/ClientToolsRegistrar';
import { NavDebugHud } from '@/components/NavDebugHud';
import { debugNav, type NavDebugToolEvent } from '@/lib/debug-nav';
import { HeroColumn } from '@/components/HeroColumn';
import { HeroIntro } from '@/components/HeroIntro';
import { Sidebar } from '@/components/Sidebar';
import { Transcript, type TranscriptMessage } from '@/components/Transcript';
import { ReadMode } from '@/components/ReadMode';
import { CVDownload } from '@/components/CVDownload';
import { SidePanel } from '@/components/SidePanel';
import { WhatsAppOverlay } from '@/components/WhatsAppOverlay';

/** Related-links panel — disabled while hero/voice layout is tuned. */
const SIDE_PANEL_ENABLED = false;

function launchChapter(
  id: ChapterId,
  sendUserMessage: (text: string) => void,
  openingAlreadyPlayed: boolean
) {
  debugNav('chapter.launch', { id, openingAlreadyPlayed });
  sendUserMessage(buildChapterNavMessage(id, openingAlreadyPlayed));
}

function launchSubItem(
  chapterId: ChapterId,
  subId: SubItemId,
  sendUserMessage: (text: string) => void,
  openingAlreadyPlayed: boolean
) {
  debugNav('chapter.launch_sub_item', {
    chapterId,
    subId,
    openingAlreadyPlayed,
  });
  sendUserMessage(
    buildSubItemNavMessage(chapterId, subId, openingAlreadyPlayed)
  );
}

const ROLE_LABELS: Record<ListenerRole, string> = {
  founder: 'Founder',
  hiring_manager: 'Hiring Manager',
  recruiter: 'Recruiter',
};

export function ConversationShell() {
  const [activeChapter, setActiveChapter] = useState<ChapterId | null>(null);
  const [activeSubItem, setActiveSubItem] = useState<SubItemId | null>(null);
  const [visited, setVisited] = useState<Set<ChapterId>>(new Set());
  const [cvVisible, setCvVisible] = useState(false);
  const [readMode, setReadMode] = useState(false);
  const [listenerRole, setListenerRole] = useState<ListenerRole | null>(null);
  const [sidePanelDismissed, setSidePanelDismissed] = useState(false);
  const [forceSidePanel, setForceSidePanel] = useState(false);
  const [messages, setMessages] = useState<TranscriptMessage[]>([]);
  const [sessionError, setSessionError] = useState<string>();
  const [navOpen, setNavOpen] = useState(false);
  /** True from start click until call ends — keeps nav available before status flips. */
  const [navSessionActive, setNavSessionActive] = useState(false);
  const [whatsAppOpen, setWhatsAppOpen] = useState(false);
  const [lastToolDebug, setLastToolDebug] = useState<NavDebugToolEvent | null>(
    null
  );

  const pendingChapterRef = useRef<ChapterId | null>(null);
  const pendingSubItemRef = useRef<SubItemId | null>(null);
  const startingRef = useRef(false);
  const greetingPlayedRef = useRef(false);
  /** After first nav or first agent speech — no more "Hey I'm Ward" on later clicks. */
  const sessionIntroConsumedRef = useRef(false);
  /** Sidebar connect: ElevenLabs first message suppressed for this session. */
  const skipAgentFirstMessageRef = useRef(false);
  const sendUserMessageRef = useRef<(text: string) => void>(() => {});
  const sendContextualUpdateRef = useRef<(text: string) => void>(() => {});
  const beatSchedulerRef = useRef(new BeatScheduler());
  const pendingAgentTextRef = useRef('');
  const activeChapterRef = useRef<ChapterId | null>(null);
  const currentAgentTurnIdRef = useRef(0);
  const agentTurnStartedAtRef = useRef(0);
  const alignmentScheduleKeyRef = useRef<string | null>(null);
  const alignmentUsedRef = useRef(false);
  const beatFallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (activeChapter) activeChapterRef.current = activeChapter;

  const openingAlreadyPlayedForNav = useCallback((): boolean => {
    return sessionIntroConsumedRef.current || greetingPlayedRef.current;
  }, []);

  const markSessionIntroConsumed = useCallback(() => {
    sessionIntroConsumedRef.current = true;
  }, []);

  const sendChapterNav = useCallback(
    (id: ChapterId, sendUserMessage: (text: string) => void) => {
      launchChapter(id, sendUserMessage, openingAlreadyPlayedForNav());
      markSessionIntroConsumed();
    },
    [markSessionIntroConsumed, openingAlreadyPlayedForNav]
  );

  const sendSubItemNav = useCallback(
    (
      chapterId: ChapterId,
      subId: SubItemId,
      sendUserMessage: (text: string) => void
    ) => {
      launchSubItem(
        chapterId,
        subId,
        sendUserMessage,
        openingAlreadyPlayedForNav()
      );
      markSessionIntroConsumed();
    },
    [markSessionIntroConsumed, openingAlreadyPlayedForNav]
  );

  const sendChapterNavRef = useRef(sendChapterNav);
  const sendSubItemNavRef = useRef(sendSubItemNav);
  sendChapterNavRef.current = sendChapterNav;
  sendSubItemNavRef.current = sendSubItemNav;

  const markVisited = useCallback((id: ChapterId) => {
    setVisited((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const selectChapter = useCallback(
    (id: ChapterId, source: 'ui' | 'tool') => {
      const status = conversationStatusRef.current;
      debugNav('chapter.select', {
        id,
        source,
        conversationStatus: status,
        previousChapter: activeChapterRef.current,
      });

      setActiveChapter(id);
      setActiveSubItem(null);
      pendingSubItemRef.current = null;
      setSidePanelDismissed(false);
      const chapter = getChapter(id);
      if (SIDE_PANEL_ENABLED && chapter && chapterHasSidePanel(chapter)) {
        playUiSound('panelOpen');
      }
      if (source === 'ui') playUiSound('chapterClick');

      if (source === 'ui') {
        const connected = status === 'connected';
        if (connected) {
          sendChapterNavRef.current(id, sendUserMessageRef.current);
        } else {
          pendingChapterRef.current = id;
          debugNav('chapter.select.pending_connect', { id });
          if (status === 'disconnected') {
            void startCallRef.current();
          }
        }
      } else {
        debugNav('chapter.select.tool_only', {
          id,
          note: 'UI highlight only; no launchChapter for tool source',
        });
      }
    },
    []
  );

  const selectSubItem = useCallback(
    (subId: SubItemId, source: 'ui' | 'tool') => {
      const chapterId: ChapterId = 'what-ive-built';
      const status = conversationStatusRef.current;
      debugNav('chapter.select_sub_item', {
        subId,
        source,
        conversationStatus: status,
      });

      setActiveChapter(chapterId);
      setActiveSubItem(subId);
      setSidePanelDismissed(false);
      if (source === 'ui') playUiSound('chapterClick');

      if (source === 'ui') {
        if (status === 'connected') {
          sendSubItemNavRef.current(chapterId, subId, sendUserMessageRef.current);
        } else {
          pendingChapterRef.current = chapterId;
          pendingSubItemRef.current = subId;
          debugNav('chapter.select_sub_item.pending_connect', { subId });
          if (status === 'disconnected') {
            void startCallRef.current();
          }
        }
      }
    },
    []
  );

  const handleSubItemClick = useCallback(
    (subId: SubItemId) => {
      selectSubItem(subId, 'ui');
    },
    [selectSubItem]
  );

  const conversationStatusRef = useRef<
    | 'disconnected'
    | 'connecting'
    | 'connected'
    | 'disconnecting'
    | 'error'
  >('disconnected');
  const startCallRef = useRef<() => Promise<void>>(async () => {});

  const revealAgentBeat = useCallback(
    (
      turnId: number,
      beatIndex: number,
      beatText: string,
      chapterId: ChapterId | null,
      isFirstBeat: boolean
    ) => {
      if (turnId !== currentAgentTurnIdRef.current) return;
      if (!isFirstBeat) playUiSound('beatTick');

      setMessages((prev) => {
        const withoutDuplicate = prev.filter(
          (m) =>
            !(
              m.role === 'agent' &&
              m.turnId === turnId &&
              m.beatIndex === beatIndex
            )
        );

        return [
          ...withoutDuplicate,
          {
            role: 'agent' as const,
            text: beatText,
            timestamp: new Date(),
            topicId: chapterId ?? undefined,
            beatIndex,
            turnId,
          },
        ];
      });
    },
    []
  );

  const clearBeatFallbackTimer = useCallback(() => {
    if (beatFallbackTimerRef.current) {
      clearTimeout(beatFallbackTimerRef.current);
      beatFallbackTimerRef.current = null;
    }
  }, []);

  const scheduleRemainingBeats = useCallback(
    (
      turnId: number,
      text: string,
      beats: string[],
      boundaries: ReturnType<typeof computeBeatBoundaries>,
      fromBeatIndex: number,
      elapsedMs: number
    ) => {
      const chapterId = activeChapterRef.current;
      beatSchedulerRef.current.schedule(
        beats,
        boundaries,
        {
          onRevealBeat: (beatIndex, beatText) => {
            revealAgentBeat(
              turnId,
              beatIndex,
              beatText,
              chapterId,
              beatIndex === 0
            );
          },
        },
        { fromBeatIndex, elapsedMs }
      );
    },
    [revealAgentBeat]
  );

  const startAgentTurn = useCallback(
    (rawText: string) => {
      const text = stripToolCallMarkup(rawText);
      if (!shouldShowTranscriptLine(text)) return;

      clearBeatFallbackTimer();
      beatSchedulerRef.current.cancel();
      const turnId = ++currentAgentTurnIdRef.current;
      pendingAgentTextRef.current = text;
      agentTurnStartedAtRef.current = Date.now();
      alignmentScheduleKeyRef.current = null;
      alignmentUsedRef.current = false;

      const beats = splitBeats(text);
      const chapterId = activeChapterRef.current;

      if (chapterId) markVisited(chapterId);

      if (beats.length === 0) return;

      setMessages((prev) => prev.filter((m) => m.role === 'user'));

      if (beats.length === 1) {
        setMessages((prev) => {
          const users = prev.filter((m) => m.role === 'user');
          return [
            ...users,
            {
              role: 'agent',
              text,
              timestamp: new Date(),
              topicId: chapterId ?? undefined,
              beatIndex: 0,
              turnId,
            },
          ];
        });
        return;
      }

      revealAgentBeat(turnId, 0, beats[0] ?? '', chapterId, true);

      beatFallbackTimerRef.current = setTimeout(() => {
        if (alignmentUsedRef.current) return;
        if (turnId !== currentAgentTurnIdRef.current) return;
        const elapsed = Date.now() - agentTurnStartedAtRef.current;
        const boundaries = perBeatFallbackBoundaries(beats);
        scheduleRemainingBeats(turnId, text, beats, boundaries, 1, elapsed);
      }, 900);
    },
    [
      clearBeatFallbackTimer,
      markVisited,
      revealAgentBeat,
      scheduleRemainingBeats,
    ]
  );

  const applyAlignmentSchedule = useCallback(
    (alignment: AudioEventAlignment) => {
      const text = pendingAgentTextRef.current;
      if (!text) return;

      const beats = splitBeats(text);
      if (beats.length <= 1) return;

      const charIndices = findBeatCharIndices(text, beats);
      if (!alignmentCoversCharIndex(alignment, charIndices[1] ?? 0)) {
        return;
      }

      const boundaries = computeBeatBoundaries(text, alignment, beats);
      const scheduleKey = boundaries
        .map((b) => b.startMs)
        .join(',');
      if (scheduleKey === alignmentScheduleKeyRef.current) return;
      alignmentScheduleKeyRef.current = scheduleKey;

      clearBeatFallbackTimer();
      alignmentUsedRef.current = true;
      beatSchedulerRef.current.cancel();

      const turnId = currentAgentTurnIdRef.current;
      const elapsed = Date.now() - agentTurnStartedAtRef.current;
      scheduleRemainingBeats(turnId, text, beats, boundaries, 1, elapsed);
    },
    [clearBeatFallbackTimer, scheduleRemainingBeats]
  );

  useEffect(() => {
    debugNav('chapter.active', {
      activeChapter,
      activeSubItem,
    });
  }, [activeChapter, activeSubItem]);

  const conversation = useConversation({
    onConnect: () => {
      startingRef.current = false;
      debugNav('conversation.connect', {
        registeredTools: REGISTERED_TOOLS,
        pendingChapter: pendingChapterRef.current,
        pendingSubItem: pendingSubItemRef.current,
      });
      const chapterId = pendingChapterRef.current;
      const subItemId = pendingSubItemRef.current;
      pendingChapterRef.current = null;
      pendingSubItemRef.current = null;
      if (chapterId) {
        window.setTimeout(() => {
          if (conversationStatusRef.current !== 'connected') return;
          if (subItemId) {
            sendSubItemNavRef.current(
              chapterId,
              subItemId,
              sendUserMessageRef.current
            );
          } else {
            sendChapterNavRef.current(chapterId, sendUserMessageRef.current);
          }
        }, 100);
      }
    },
    onDisconnect: () => {
      startingRef.current = false;
      greetingPlayedRef.current = false;
      sessionIntroConsumedRef.current = false;
      skipAgentFirstMessageRef.current = false;
      pendingAgentTextRef.current = '';
      clearBeatFallbackTimer();
      beatSchedulerRef.current.cancel();
      setMessages([]);
      setSessionError(undefined);
      setNavSessionActive(false);
      debugNav('conversation.disconnect');
    },
    onStatusChange: ({ status }) => {
      conversationStatusRef.current = status;
      debugNav('conversation.status', { status });
    },
    onAgentToolRequest: (request) => {
      debugNav('tool.agent_request', request);
      setLastToolDebug({
        name: request.tool_name,
        phase: 'requested',
        at: Date.now(),
      });
    },
    onAgentToolResponse: (response) => {
      debugNav('tool.agent_response', response);
      setLastToolDebug((prev) =>
        prev?.name === response.tool_name
          ? {
              ...prev,
              phase: response.is_error ? 'error' : 'done',
              at: Date.now(),
              error: response.is_error ? 'agent_tool_error' : undefined,
            }
          : {
              name: response.tool_name,
              phase: response.is_error ? 'error' : 'done',
              at: Date.now(),
            }
      );
    },
    onMessage: ({ message, role, source }) => {
      const speaker = role ?? (source === 'user' ? 'user' : 'agent');
      const text = stripToolCallMarkup(message);
      if (!shouldShowTranscriptLine(text)) return;

      if (speaker === 'user') {
        clearBeatFallbackTimer();
        beatSchedulerRef.current.cancel();
        if (isChapterNavMessage(text)) {
          debugNav('chapter.nav_message', { preview: text.slice(0, 120) });
          return;
        }
        setMessages((prev) => [
          ...prev.filter((m) => m.role !== 'user'),
          { role: 'user', text, timestamp: new Date() },
        ]);
        return;
      }

      if (speaker === 'agent') {
        const skipOpening =
          skipAgentFirstMessageRef.current ||
          (greetingPlayedRef.current && isGenericOpeningGreeting(text));

        if (skipOpening && isGenericOpeningGreeting(text)) {
          skipAgentFirstMessageRef.current = false;
          greetingPlayedRef.current = true;
          sessionIntroConsumedRef.current = true;
          debugNav('conversation.skip_opening_script', {
            preview: text.slice(0, 100),
          });
          return;
        }

        if (skipAgentFirstMessageRef.current) {
          skipAgentFirstMessageRef.current = false;
        }

        greetingPlayedRef.current = true;
        sessionIntroConsumedRef.current = true;
        startAgentTurn(text);
      }
    },
    onAudioAlignment: (alignment) => {
      applyAlignmentSchedule(alignment);
    },
    onInterruption: () => {
      clearBeatFallbackTimer();
      beatSchedulerRef.current.cancel();
      alignmentScheduleKeyRef.current = null;
      alignmentUsedRef.current = false;
      currentAgentTurnIdRef.current++;
    },
    onAgentResponseCorrection: ({ corrected_agent_response }) => {
      clearBeatFallbackTimer();
      beatSchedulerRef.current.cancel();
      const corrected = stripToolCallMarkup(
        corrected_agent_response ?? ''
      );
      if (!corrected) return;
      pendingAgentTextRef.current = corrected;
      const turnId = ++currentAgentTurnIdRef.current;
      const beats = splitBeats(corrected);
      const chapterId = activeChapterRef.current;
      if (chapterId) markVisited(chapterId);
      setMessages((prev) => {
        const users = prev.filter((m) => m.role === 'user');
        const agentBeats = beats.map((beatText, beatIndex) => ({
          role: 'agent' as const,
          text: beatText,
          timestamp: new Date(),
          topicId: chapterId ?? undefined,
          beatIndex,
          turnId,
        }));
        return [...users, ...agentBeats];
      });
    },
    onUnhandledClientToolCall: (call) => {
      debugNav('tool.unhandled', {
        tool_name: call.tool_name,
        tool_call_id: call.tool_call_id,
        parameters: call.parameters,
        registeredTools: REGISTERED_TOOLS,
      });
      setLastToolDebug({
        name: call.tool_name,
        phase: 'unhandled',
        at: Date.now(),
        parameters: call.parameters,
      });
      console.warn('[ask-ward] Unhandled client tool:', call.tool_name, call);
    },
    onError: (err) => {
      debugNav('conversation.error', { err });
      console.error('Conversation error', err);
      startingRef.current = false;
      setSessionError(typeof err === 'string' ? err : 'Connection error');
    },
    onDebug: (info) => {
      debugNav('conversation.debug', info);
    },
  });

  conversationStatusRef.current = conversation.status;
  sendUserMessageRef.current = conversation.sendUserMessage;
  sendContextualUpdateRef.current = conversation.sendContextualUpdate;

  useEffect(() => {
    if (navSessionActive) {
      setNavOpen(true);
    }
  }, [navSessionActive]);

  const conversationRef = useRef(conversation);
  conversationRef.current = conversation;

  useEffect(() => {
    return () => {
      if (beatFallbackTimerRef.current) {
        clearTimeout(beatFallbackTimerRef.current);
      }
      beatSchedulerRef.current.cancel();
      const c = conversationRef.current;
      if (c.status === 'connected' || c.status === 'connecting') {
        void c.endSession();
      }
    };
  }, []);

  const startCall = useCallback(async () => {
    if (
      startingRef.current ||
      conversation.status === 'connected' ||
      conversation.status === 'connecting'
    ) {
      return;
    }

    startingRef.current = true;
    setSessionError(undefined);
    setNavSessionActive(true);
    setNavOpen(true);
    debugNav('conversation.startCall');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
    } catch {
      startingRef.current = false;
      setNavSessionActive(false);
      setNavOpen(false);
      setSessionError('Microphone access is required for voice mode.');
      setReadMode(true);
      return;
    }

    try {
      const r = await fetch('/api/conversation-token');
      const body = (await r.json()) as {
        conversationToken?: string;
        error?: string;
      };
      if (!r.ok || !body.conversationToken) {
        let err = body.error ?? 'Failed to get conversation token';
        try {
          const nested = JSON.parse(err) as { detail?: { message?: string } };
          err = nested.detail?.message ?? err;
        } catch {
          /* use err as-is */
        }
        throw new Error(err);
      }

      const pendingChapter = pendingChapterRef.current;
      const pendingSubItem = pendingSubItemRef.current;
      const skipOpening = Boolean(pendingChapter);

      if (skipOpening) {
        skipAgentFirstMessageRef.current = true;
      }

      const dynamicVariables: Record<string, string | boolean> = {};
      if (pendingChapter) {
        dynamicVariables.initial_chapter = pendingChapter;
        dynamicVariables.chapter_first_connect = true;
      }
      if (pendingSubItem) {
        dynamicVariables.initial_sub_item = pendingSubItem;
      }

      conversation.startSession({
        conversationToken: body.conversationToken,
        connectionType: 'webrtc',
        ...(skipOpening
          ? { overrides: { agent: { firstMessage: '' } } }
          : {}),
        ...(Object.keys(dynamicVariables).length > 0 ? { dynamicVariables } : {}),
      });
    } catch (err) {
      startingRef.current = false;
      pendingChapterRef.current = null;
      setNavSessionActive(false);
      setNavOpen(false);
      setSessionError(err instanceof Error ? err.message : String(err));
    }
  }, [conversation]);

  startCallRef.current = startCall;

  const endCall = useCallback(() => {
    startingRef.current = false;
    pendingChapterRef.current = null;
    pendingSubItemRef.current = null;
    pendingAgentTextRef.current = '';
    greetingPlayedRef.current = false;
    sessionIntroConsumedRef.current = false;
    skipAgentFirstMessageRef.current = false;
    currentAgentTurnIdRef.current = 0;
    alignmentScheduleKeyRef.current = null;
    alignmentUsedRef.current = false;
    clearBeatFallbackTimer();
    beatSchedulerRef.current.cancel();
    setMessages([]);
    setSessionError(undefined);
    setNavSessionActive(false);
    setNavOpen(false);
    conversation.endSession();
  }, [clearBeatFallbackTimer, conversation]);

  const handleStartFromOrb = useCallback(() => {
    pendingChapterRef.current = null;
    pendingSubItemRef.current = null;
    skipAgentFirstMessageRef.current = false;
    void startCall();
  }, [startCall]);

  const connectToWard = useCallback(() => {
    if (SIDE_PANEL_ENABLED) {
      setForceSidePanel(true);
      setSidePanelDismissed(false);
    }
    playUiSound('panelOpen');
    setWhatsAppOpen(true);
  }, []);

  const activeChapterData = activeChapter
    ? getChapter(activeChapter)
    : undefined;
  const showSidePanel =
    SIDE_PANEL_ENABLED &&
    ((activeChapterData &&
      chapterHasSidePanel(activeChapterData) &&
      !sidePanelDismissed) ||
      forceSidePanel);

  const displayError = sessionError ?? conversation.message;
  const roleLabel = listenerRole ? ROLE_LABELS[listenerRole] : null;
  const voiceActive = conversation.status !== 'disconnected';

  return (
    <div className="bg-bg-base text-text-primary">
      <ClientToolsRegistrar
        selectChapter={selectChapter}
        selectSubItem={selectSubItem}
        setCvVisible={setCvVisible}
        setReadMode={setReadMode}
        setRole={setListenerRole}
        onToolDebug={setLastToolDebug}
        openSidePanel={() => {
          if (!SIDE_PANEL_ENABLED) return;
          setSidePanelDismissed(false);
          setForceSidePanel(false);
          playUiSound('panelOpen');
        }}
        connectToWard={connectToWard}
      />
      <NavDebugHud
        conversationStatus={conversation.status}
        activeChapter={activeChapter}
        activeSubItem={activeSubItem}
        lastTool={lastToolDebug}
        registeredTools={[...REGISTERED_TOOLS]}
      />
      <WhatsAppOverlay
        open={whatsAppOpen}
        onClose={() => {
          playUiSound('panelClose');
          setWhatsAppOpen(false);
        }}
      />
      <section
        id="voice-conversation"
        aria-label="Voice conversation"
        className="relative flex h-screen min-h-0 overflow-hidden"
      >
        <Sidebar
          open={navOpen}
          onOpenChange={setNavOpen}
          activeChapter={activeChapter}
          activeSubItem={activeSubItem}
          visited={visited}
          onSelectChapter={(id) => selectChapter(id, 'ui')}
          onSelectSubItem={handleSubItemClick}
        />
        <main className="relative flex h-full min-h-0 flex-1 flex-col overflow-x-clip overflow-y-hidden">
          <div className="absolute right-8 top-8 z-10 flex items-center gap-3">
            <CVDownload visible={cvVisible} />
          </div>
          {readMode ? (
            <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto px-6 py-16 lg:px-12">
              <ReadMode
                chapterId={activeChapter}
                onExit={() => setReadMode(false)}
              />
            </div>
          ) : (
            <div className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden">
              <HeroColumn
                active={voiceActive}
                status={conversation.status}
                isSpeaking={conversation.isSpeaking}
                onStart={handleStartFromOrb}
                onEnd={endCall}
                errorMessage={displayError}
              />
              <div className="pointer-events-none relative z-10 flex min-h-0 flex-1 flex-col justify-start px-4 pb-4 pt-3 max-lg:w-full md:pl-[8%] md:px-6 md:pb-6 md:pt-4 lg:pl-[10%] lg:pr-12 lg:pt-6">
                <div className="main-content-column pointer-events-auto flex min-h-0 flex-1 flex-col gap-3 lg:gap-4">
                  <HeroIntro
                    navOpen={navOpen}
                    onToggleNav={() => setNavOpen((open) => !open)}
                    onTalkToMe={handleStartFromOrb}
                    isConnecting={conversation.status === 'connecting'}
                    status={conversation.status}
                    isSpeaking={conversation.isSpeaking}
                    onEnd={endCall}
                    errorMessage={displayError}
                    roleLabel={roleLabel}
                  />
                  <Transcript messages={messages} variant="main" />
                </div>
              </div>
              {showSidePanel && (
                <SidePanel
                  chapter={activeChapterData}
                  dismissed={sidePanelDismissed}
                  onDismiss={() => {
                    setSidePanelDismissed(true);
                    setForceSidePanel(false);
                  }}
                  onNavigateChapter={(id) => selectChapter(id, 'ui')}
                  onConnectWard={connectToWard}
                  forceOpen={forceSidePanel}
                />
              )}
            </div>
          )}
        </main>
      </section>
    </div>
  );
}
