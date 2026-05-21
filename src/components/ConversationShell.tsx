'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useConversation } from '@elevenlabs/react';
import {
  getChapter,
  getSubItemLabel,
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
  isChapterNavMessage,
} from '@/lib/chapter-nav';
import {
  shouldShowTranscriptLine,
  stripToolCallMarkup,
} from '@/lib/transcript';
import { playUiSound } from '@/lib/ui-sounds';
import { ClientToolsRegistrar } from '@/components/ClientToolsRegistrar';
import { Hero } from '@/components/Hero';
import { Sidebar } from '@/components/Sidebar';
import { VoiceOrb } from '@/components/VoiceOrb';
import { Transcript, type TranscriptMessage } from '@/components/Transcript';
import { ReadMode } from '@/components/ReadMode';
import { CVDownload } from '@/components/CVDownload';
import { SidePanel } from '@/components/SidePanel';

function launchChapter(
  id: ChapterId,
  sendUserMessage: (text: string) => void,
  openingAlreadyPlayed: boolean
) {
  sendUserMessage(buildChapterNavMessage(id, openingAlreadyPlayed));
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

  const pendingChapterRef = useRef<ChapterId | null>(null);
  const startingRef = useRef(false);
  const greetingPlayedRef = useRef(false);
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
      setActiveChapter(id);
      setActiveSubItem(null);
      setSidePanelDismissed(false);
      const chapter = getChapter(id);
      if (chapter && chapterHasSidePanel(chapter)) {
        playUiSound('panelOpen');
      }
      if (source === 'ui') playUiSound('chapterClick');

      if (source === 'ui') {
        const connected =
          conversationStatusRef.current === 'connected';
        if (connected) {
          launchChapter(
            id,
            sendUserMessageRef.current,
            greetingPlayedRef.current || skipAgentFirstMessageRef.current
          );
        } else {
          pendingChapterRef.current = id;
          if (conversationStatusRef.current === 'disconnected') {
            void startCallRef.current();
          }
        }
      }
    },
    []
  );

  const handleSubItemClick = useCallback(
    (subId: SubItemId) => {
      if (activeChapter !== 'what-ive-built') {
        selectChapter('what-ive-built', 'ui');
      }
      setActiveSubItem(subId);
      const label = getSubItemLabel('what-ive-built', subId);
      if (
        conversationStatusRef.current === 'connected' &&
        label
      ) {
        sendContextualUpdateRef.current(
          `The listener jumped to the "${label}" section within What I've built. Do not restart the chapter; continue from that section if appropriate.`
        );
      }
    },
    [activeChapter, selectChapter]
  );

  const conversationStatusRef = useRef<
    'disconnected' | 'connecting' | 'connected' | 'error'
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

  const conversation = useConversation({
    onConnect: () => {
      startingRef.current = false;
      const chapterId = pendingChapterRef.current;
      pendingChapterRef.current = null;
      if (chapterId) {
        launchChapter(
          chapterId,
          sendUserMessageRef.current,
          greetingPlayedRef.current || skipAgentFirstMessageRef.current
        );
      }
    },
    onDisconnect: () => {
      startingRef.current = false;
      greetingPlayedRef.current = false;
      skipAgentFirstMessageRef.current = false;
      clearBeatFallbackTimer();
      beatSchedulerRef.current.cancel();
    },
    onMessage: ({ message, role, source }) => {
      const speaker = role ?? (source === 'user' ? 'user' : 'agent');
      const text = stripToolCallMarkup(message);
      if (!shouldShowTranscriptLine(text)) return;

      if (speaker === 'user') {
        clearBeatFallbackTimer();
        beatSchedulerRef.current.cancel();
        if (isChapterNavMessage(text)) return;
        setMessages([{ role: 'user', text, timestamp: new Date() }]);
        return;
      }

      if (speaker === 'agent') {
        greetingPlayedRef.current = true;
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
      console.warn('[ask-ward] Unhandled client tool:', call.tool_name, call);
    },
    onError: (err) => {
      console.error('Conversation error', err);
      startingRef.current = false;
      setSessionError(typeof err === 'string' ? err : 'Connection error');
    },
  });

  conversationStatusRef.current = conversation.status;
  sendUserMessageRef.current = conversation.sendUserMessage;
  sendContextualUpdateRef.current = conversation.sendContextualUpdate;

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

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
    } catch {
      startingRef.current = false;
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
      if (pendingChapter) {
        skipAgentFirstMessageRef.current = true;
      }

      conversation.startSession({
        conversationToken: body.conversationToken,
        connectionType: 'webrtc',
        ...(pendingChapter
          ? {
              overrides: {
                agent: { firstMessage: ' ' },
              },
              dynamicVariables: {
                initial_chapter: pendingChapter,
                chapter_first_connect: true,
              },
            }
          : {}),
      });
    } catch (err) {
      startingRef.current = false;
      pendingChapterRef.current = null;
      setSessionError(err instanceof Error ? err.message : String(err));
    }
  }, [conversation]);

  startCallRef.current = startCall;

  const endCall = useCallback(() => {
    startingRef.current = false;
    pendingChapterRef.current = null;
    greetingPlayedRef.current = false;
    skipAgentFirstMessageRef.current = false;
    beatSchedulerRef.current.cancel();
    conversation.endSession();
  }, [conversation]);

  const handleStartFromOrb = useCallback(() => {
    pendingChapterRef.current = null;
    skipAgentFirstMessageRef.current = false;
    void startCall();
  }, [startCall]);

  const connectToWard = useCallback(() => {
    setForceSidePanel(true);
    setSidePanelDismissed(false);
    const url = process.env.NEXT_PUBLIC_WHATSAPP_URL;
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }, []);

  const activeChapterData = activeChapter
    ? getChapter(activeChapter)
    : undefined;
  const showSidePanel =
    (activeChapterData &&
      chapterHasSidePanel(activeChapterData) &&
      !sidePanelDismissed) ||
    forceSidePanel;

  const displayError = sessionError ?? conversation.message;
  const roleLabel = listenerRole ? ROLE_LABELS[listenerRole] : null;

  return (
    <div className="bg-bg-base text-text-primary">
      <ClientToolsRegistrar
        selectChapter={selectChapter}
        setCvVisible={setCvVisible}
        setReadMode={setReadMode}
        setRole={setListenerRole}
        openSidePanel={() => {
          setSidePanelDismissed(false);
          setForceSidePanel(false);
          playUiSound('panelOpen');
        }}
        connectToWard={connectToWard}
      />
      <Hero
        onTalkToMe={handleStartFromOrb}
        isConnecting={conversation.status === 'connecting'}
        roleLabel={roleLabel}
      />
      <section
        id="voice-conversation"
        aria-label="Voice conversation"
        className="relative z-0 flex h-screen min-h-0"
      >
        <Sidebar
          activeChapter={activeChapter}
          activeSubItem={activeSubItem}
          visited={visited}
          onSelectChapter={(id) => selectChapter(id, 'ui')}
          onSelectSubItem={handleSubItemClick}
        />
        <main className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden">
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
            <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
              <div className="flex min-h-0 flex-1 flex-col">
                <div className="flex min-h-0 flex-1 items-center justify-center px-6 pt-16 lg:px-12">
                  <VoiceOrb
                    status={conversation.status}
                    isSpeaking={conversation.isSpeaking}
                    showPortrait={
                      conversation.status === 'connected' &&
                      !conversation.isSpeaking
                    }
                    onStart={handleStartFromOrb}
                    onEnd={endCall}
                    errorMessage={displayError}
                  />
                </div>
                <div className="flex shrink-0 justify-center px-6 pb-8 pt-2 lg:px-12">
                  <Transcript messages={messages} />
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
