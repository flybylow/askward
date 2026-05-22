'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useConversation } from '@elevenlabs/react';
import {
  getChapter,
  getSubItem,
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
import { buildChapterNavMessage, isChapterNavMessage } from '@/lib/chapter-nav';
import {
  shouldShowTranscriptLine,
  stripToolCallMarkup,
  isGenericOpeningGreeting,
} from '@/lib/transcript';
import { playUiSound } from '@/lib/ui-sounds';
import { resolveOrbPhase } from '@/lib/orb-phase';
import { useUserSpeaking } from '@/lib/use-user-speaking';
import { cn } from '@/lib/utils';
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

const ROLE_LABELS: Record<ListenerRole, string> = {
  founder: 'Founder',
  hiring_manager: 'Hiring Manager',
  recruiter: 'Recruiter',
};

type ConnectIntent = {
  chapter: ChapterId;
  subItem: SubItemId | null;
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
  const [isThinking, setIsThinking] = useState(false);
  const [lastToolDebug, setLastToolDebug] = useState<NavDebugToolEvent | null>(
    null
  );
  const thinkingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const vadHandlerRef = useRef<(props: { vadScore: number }) => void>(() => {});

  const pendingChapterRef = useRef<ChapterId | null>(null);
  const pendingSubItemRef = useRef<SubItemId | null>(null);
  /** Saved on sidebar click while disconnected — survives until session ends. */
  const connectIntentRef = useRef<ConnectIntent | null>(null);
  /** Snapshot taken right before startSession — recalled in onConnect. */
  const launchAfterConnectRef = useRef<ConnectIntent | null>(null);
  /** Queued in onConnect; launched after React binds the live sendUserMessage. */
  const pendingLaunchNavRef = useRef<ConnectIntent | null>(null);
  const startingRef = useRef(false);
  const greetingPlayedRef = useRef(false);
  /** After first nav or first agent speech — no more "Hey I'm Ward" on later clicks. */
  const sessionIntroConsumedRef = useRef(false);
  /** Sidebar connect: ElevenLabs first message suppressed for this session. */
  const skipAgentFirstMessageRef = useRef(false);
  /** User clicked End — blocks late onConnect / launch nav / agent turns until next startCall. */
  const endRequestedRef = useRef(false);
  /** True from endCall until onDisconnect — blocks overlapping startCall. */
  const endingSessionRef = useRef(false);
  const sendUserMessageRef = useRef<(text: string) => void>(() => {});
  const sendContextualUpdateRef = useRef<(text: string) => void>(() => {});
  const beatSchedulerRef = useRef(new BeatScheduler());
  const pendingAgentTextRef = useRef('');
  const activeChapterRef = useRef<ChapterId | null>(null);
  const activeSubItemRef = useRef<SubItemId | null>(null);
  const currentAgentTurnIdRef = useRef(0);
  const agentTurnStartedAtRef = useRef(0);
  const alignmentScheduleKeyRef = useRef<string | null>(null);
  const alignmentUsedRef = useRef(false);
  const beatFallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const conversationRef = useRef<{
    sendUserMessage: (text: string) => void;
    sendContextualUpdate: (text: string) => void;
    status: string;
    endSession: () => void | Promise<void>;
  } | null>(null);

  activeChapterRef.current = activeChapter;
  activeSubItemRef.current = activeSubItem;

  const openingAlreadyPlayedForNav = useCallback((): boolean => {
    return sessionIntroConsumedRef.current || greetingPlayedRef.current;
  }, []);

  const markSessionIntroConsumed = useCallback(() => {
    sessionIntroConsumedRef.current = true;
  }, []);

  const clearThinking = useCallback(() => {
    if (thinkingTimeoutRef.current) {
      clearTimeout(thinkingTimeoutRef.current);
      thinkingTimeoutRef.current = null;
    }
    setIsThinking(false);
  }, []);

  const markThinking = useCallback(() => {
    if (endRequestedRef.current) return;
    setIsThinking(true);
    if (thinkingTimeoutRef.current) {
      clearTimeout(thinkingTimeoutRef.current);
    }
    thinkingTimeoutRef.current = setTimeout(() => {
      setIsThinking(false);
      thinkingTimeoutRef.current = null;
    }, 15_000);
  }, []);

  const sendChapterNav = useCallback(
    (id: ChapterId, sendUserMessage: (text: string) => void) => {
      markThinking();
      launchChapter(id, sendUserMessage, openingAlreadyPlayedForNav());
      markSessionIntroConsumed();
    },
    [markSessionIntroConsumed, markThinking, openingAlreadyPlayedForNav]
  );

  const sendChapterNavRef = useRef(sendChapterNav);
  sendChapterNavRef.current = sendChapterNav;

  const clearConnectIntent = useCallback(() => {
    connectIntentRef.current = null;
    pendingChapterRef.current = null;
    pendingSubItemRef.current = null;
  }, []);

  const rememberConnectIntent = useCallback(
    (chapter: ChapterId, subItem: SubItemId | null) => {
      const intent: ConnectIntent = { chapter, subItem };
      connectIntentRef.current = intent;
      pendingChapterRef.current = chapter;
      pendingSubItemRef.current = subItem;
      debugNav('chapter.connect_intent.saved', intent);
    },
    []
  );

  /** Rebuild intent from refs when retrying Click to start after a sidebar pick. */
  const recallConnectIntent = useCallback((): ConnectIntent | null => {
    if (connectIntentRef.current) {
      return connectIntentRef.current;
    }
    if (!activeChapterRef.current) {
      return null;
    }
    const intent: ConnectIntent = {
      chapter: activeChapterRef.current,
      subItem: activeSubItemRef.current,
    };
    connectIntentRef.current = intent;
    pendingChapterRef.current = intent.chapter;
    pendingSubItemRef.current = intent.subItem;
    debugNav('chapter.connect_intent.recalled', intent);
    return intent;
  }, []);

  const queueSidebarNav = useCallback(
    (chapterId: ChapterId, subItemId: SubItemId | null) => {
      const sendUserMessage =
        conversationRef.current?.sendUserMessage ??
        sendUserMessageRef.current;
      if (typeof sendUserMessage !== 'function') {
        debugNav('conversation.launch_nav.no_sender', {
          chapterId,
          subItemId,
        });
        return false;
      }
      if (skipAgentFirstMessageRef.current) {
        sessionIntroConsumedRef.current = true;
      }
      sendChapterNavRef.current(chapterId, sendUserMessage);
      return true;
    },
    []
  );

  /** Sidebar-first connect — contextual update avoids agent end_call from [nav] user_message. */
  const deliverConnectNav = useCallback(
    (chapterId: ChapterId, subItemId: SubItemId | null) => {
      const sendContextualUpdate =
        conversationRef.current?.sendContextualUpdate ??
        sendContextualUpdateRef.current;
      if (typeof sendContextualUpdate !== 'function') {
        debugNav('conversation.launch_contextual.no_sender', {
          chapterId,
          subItemId,
        });
        return false;
      }
      sessionIntroConsumedRef.current = true;
      markThinking();
      const navText = buildChapterNavMessage(chapterId, true);
      debugNav('chapter.launch_contextual', {
        chapterId,
        subItemId,
        note: 'sub-items are transcript scroll only; agent speaks full chapter',
        preview: navText.slice(0, 120),
      });
      sendContextualUpdate(navText);
      return true;
    },
    [markThinking]
  );

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
          rememberConnectIntent(id, null);
          markThinking();
          debugNav('chapter.select.pending_connect', { id });
          if (status === 'disconnected' || status === 'error') {
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
          if (activeChapterRef.current !== chapterId) {
            sendChapterNavRef.current(chapterId, sendUserMessageRef.current);
          }
        } else if (status !== 'connecting') {
          rememberConnectIntent(chapterId, subId);
          markThinking();
          debugNav('chapter.select_sub_item.pending_connect', { subId });
          if (status === 'disconnected' || status === 'error') {
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
      if (endRequestedRef.current) return;
      clearThinking();
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
      clearThinking,
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
    onVadScore: (props) => vadHandlerRef.current(props),
    onConnect: () => {
      startingRef.current = false;
      if (endRequestedRef.current) {
        debugNav('conversation.connect.ignored_after_end');
        launchAfterConnectRef.current = null;
        pendingLaunchNavRef.current = null;
        return;
      }
      const launch = launchAfterConnectRef.current;
      launchAfterConnectRef.current = null;
      debugNav('conversation.connect', {
        registeredTools: REGISTERED_TOOLS,
        chapterId: launch?.chapter,
        subItemId: launch?.subItem,
        skipOpening: skipAgentFirstMessageRef.current,
        fromLaunchSnapshot: Boolean(launch),
      });
      clearConnectIntent();

      if (launch?.chapter) {
        pendingLaunchNavRef.current = launch;
        markThinking();
      }
    },
    onDisconnect: (details) => {
      startingRef.current = false;
      endingSessionRef.current = false;
      clearThinking();
      greetingPlayedRef.current = false;
      sessionIntroConsumedRef.current = false;
      skipAgentFirstMessageRef.current = false;
      pendingAgentTextRef.current = '';
      pendingLaunchNavRef.current = null;
      if (launchAfterConnectRef.current) {
        debugNav('conversation.disconnect.intent_preserved', {
          launch: launchAfterConnectRef.current,
        });
      } else {
        clearConnectIntent();
      }
      clearBeatFallbackTimer();
      beatSchedulerRef.current.cancel();
      setMessages([]);
      setSessionError(undefined);
      setNavSessionActive(false);
      debugNav('conversation.disconnect', details ?? {});
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
      if (response.tool_name === 'end_call') {
        debugNav('conversation.agent_end_call', response);
      }
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
        if (endRequestedRef.current) return;

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
      if (endRequestedRef.current) return;
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
      if (endRequestedRef.current) return;
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
  conversationRef.current = conversation;

  const { isUserSpeaking, onVadScore } = useUserSpeaking({
    enabled: conversation.status === 'connected',
    suppress: conversation.isSpeaking,
  });
  vadHandlerRef.current = onVadScore;

  const orbPhase = useMemo(
    () =>
      resolveOrbPhase({
        status: conversation.status,
        agentSpeaking: conversation.isSpeaking,
        userSpeaking: isUserSpeaking,
        thinking: isThinking,
      }),
    [conversation.status, conversation.isSpeaking, isUserSpeaking, isThinking]
  );

  useEffect(() => {
    if (conversation.status !== 'connected') return;
    if (endRequestedRef.current) return;
    const launch = pendingLaunchNavRef.current;
    if (!launch?.chapter) return;

    pendingLaunchNavRef.current = null;
    debugNav('conversation.connect.launch_nav', launch);
    const launched = deliverConnectNav(launch.chapter, null);
    if (!launched) {
      pendingLaunchNavRef.current = launch;
      debugNav('conversation.connect.launch_nav_deferred', launch);
    }
  }, [conversation.status, deliverConnectNav]);

  useEffect(() => {
    if (navSessionActive) {
      setNavOpen(true);
    }
  }, [navSessionActive]);

  useEffect(() => {
    return () => {
      if (beatFallbackTimerRef.current) {
        clearTimeout(beatFallbackTimerRef.current);
      }
      beatSchedulerRef.current.cancel();
      const c = conversationRef.current;
      if (c && (c.status === 'connected' || c.status === 'connecting')) {
        void c.endSession();
      }
    };
  }, []);

  const startCall = useCallback(async () => {
    if (
      startingRef.current ||
      endingSessionRef.current ||
      conversation.status === 'connected' ||
      conversation.status === 'connecting'
    ) {
      return;
    }

    endRequestedRef.current = false;
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

      const intent = recallConnectIntent();
      const pendingChapter = intent?.chapter ?? null;
      const pendingSubItem = intent?.subItem ?? null;
      const skipOpening = Boolean(pendingChapter);

      if (skipOpening) {
        skipAgentFirstMessageRef.current = true;
        launchAfterConnectRef.current = {
          chapter: pendingChapter as ChapterId,
          subItem: pendingSubItem,
        };
      } else {
        launchAfterConnectRef.current = null;
      }

      const dynamicVariables: Record<string, string | boolean> = {};
      if (pendingChapter) {
        dynamicVariables.initial_chapter = pendingChapter;
        dynamicVariables.chapter_first_connect = true;
      }
      debugNav('conversation.startSession', {
        skipOpening,
        dynamicVariables,
        launchAfterConnect: launchAfterConnectRef.current,
      });

      conversation.startSession({
        conversationToken: body.conversationToken,
        connectionType: 'webrtc',
        ...(skipOpening ? { dynamicVariables } : {}),
      });
    } catch (err) {
      startingRef.current = false;
      launchAfterConnectRef.current = null;
      setNavSessionActive(false);
      setSessionError(err instanceof Error ? err.message : String(err));
    }
  }, [conversation, recallConnectIntent]);

  startCallRef.current = startCall;

  const endCall = useCallback(() => {
    endRequestedRef.current = true;
    endingSessionRef.current = true;
    clearThinking();
    startingRef.current = false;
    launchAfterConnectRef.current = null;
    pendingLaunchNavRef.current = null;
    clearConnectIntent();
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
  }, [clearBeatFallbackTimer, clearConnectIntent, clearThinking, conversation]);

  const handleStartFromOrb = useCallback(() => {
    const intent = recallConnectIntent();
    skipAgentFirstMessageRef.current = Boolean(intent?.chapter);
    void startCall();
  }, [recallConnectIntent, startCall]);

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

  const scrollToBeatIndex = useMemo(() => {
    if (activeChapter !== 'what-ive-built' || !activeSubItem) return null;
    return getSubItem('what-ive-built', activeSubItem)?.beatStart ?? null;
  }, [activeChapter, activeSubItem]);

  const displayError = sessionError ?? conversation.message;
  const roleLabel = listenerRole ? ROLE_LABELS[listenerRole] : null;
  const voiceActive = conversation.status !== 'disconnected';
  const hasLiveMessages = messages.length > 0;

  return (
    <div className="min-h-0 bg-transparent text-text-primary">
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
        messages={messages}
        onClose={() => {
          playUiSound('panelClose');
          setWhatsAppOpen(false);
        }}
      />
      <section
        id="voice-conversation"
        aria-label="Voice conversation"
        className="relative flex h-dvh min-h-0 overflow-hidden"
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
        <main className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-transparent">
          {readMode ? (
            <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto px-6 py-16 lg:px-12">
              <ReadMode
                chapterId={activeChapter}
                onExit={() => setReadMode(false)}
              />
            </div>
          ) : (
            <div className="conversation-stage">
              <HeroColumn
                active={voiceActive}
                status={conversation.status}
                phase={orbPhase}
                onStart={handleStartFromOrb}
                onEnd={endCall}
                errorMessage={displayError}
              />
              <div className="relative z-10 flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
                <div className="conversation-content">
                  <div
                    className={cn(
                      'main-content-column flex flex-col gap-4',
                      hasLiveMessages && 'main-content-column--live'
                    )}
                  >
                    <div className="flex shrink-0 justify-end">
                      <CVDownload visible={cvVisible} />
                    </div>
                    <HeroIntro
                      navOpen={navOpen}
                      onToggleNav={() => setNavOpen((open) => !open)}
                      onTalkToMe={handleStartFromOrb}
                      isConnecting={conversation.status === 'connecting'}
                      status={conversation.status}
                      phase={orbPhase}
                      onEnd={endCall}
                      errorMessage={displayError}
                      roleLabel={roleLabel}
                    />
                    <Transcript
                      messages={messages}
                      variant="main"
                      scrollToBeatIndex={scrollToBeatIndex}
                    />
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
            </div>
          )}
        </main>
      </section>
    </div>
  );
}
