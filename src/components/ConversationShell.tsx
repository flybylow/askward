'use client';

import { useCallback, useRef, useState } from 'react';
import { useConversation } from '@elevenlabs/react';
import { CHAPTERS } from '@/lib/chapters';
import type { ChapterId } from '@/lib/client-tools';
import {
  shouldShowTranscriptLine,
  stripToolCallMarkup,
} from '@/lib/transcript';
import { ClientToolsRegistrar } from '@/components/ClientToolsRegistrar';
import { Hero } from '@/components/Hero';
import { Sidebar } from '@/components/Sidebar';
import { VoiceOrb } from '@/components/VoiceOrb';
import { Transcript, type TranscriptMessage } from '@/components/Transcript';
import { ReadMode } from '@/components/ReadMode';
import { CVDownload } from '@/components/CVDownload';

function chapterUserMessage(id: ChapterId): string {
  const label = CHAPTERS.find((c) => c.id === id)?.label ?? id;
  return `I'd like to hear the "${label}" chapter (${id}).`;
}

function chapterContextMessage(id: ChapterId): string {
  const label = CHAPTERS.find((c) => c.id === id)?.label ?? id;
  return `The user clicked on the "${label}" chapter (${id}) in the sidebar. Acknowledge briefly and enter that chapter. Remember to call highlightChapter with chapterId "${id}".`;
}

function launchChapter(
  id: ChapterId,
  sendUserMessage: (text: string) => void,
  sendContextualUpdate: (text: string) => void
) {
  sendContextualUpdate(chapterContextMessage(id));
  sendUserMessage(chapterUserMessage(id));
}

export function ConversationShell() {
  const [activeChapter, setActiveChapter] = useState<ChapterId>('intro');
  const [cvVisible, setCvVisible] = useState(false);
  const [readMode, setReadMode] = useState(false);
  const [messages, setMessages] = useState<TranscriptMessage[]>([]);
  const [sessionError, setSessionError] = useState<string>();
  const pendingChapterRef = useRef<ChapterId | null>(null);
  const startingRef = useRef(false);
  const sendUserMessageRef = useRef<(text: string) => void>(() => {});
  const sendContextualUpdateRef = useRef<(text: string) => void>(() => {});

  const conversation = useConversation({
    onConnect: () => {
      startingRef.current = false;
      const chapterId = pendingChapterRef.current;
      pendingChapterRef.current = null;
      if (chapterId) {
        launchChapter(
          chapterId,
          sendUserMessageRef.current,
          sendContextualUpdateRef.current
        );
      }
    },
    onDisconnect: () => {
      startingRef.current = false;
    },
    onMessage: ({ message, role, source }) => {
      const speaker = role ?? (source === 'user' ? 'user' : 'agent');
      const text = stripToolCallMarkup(message);
      if (!shouldShowTranscriptLine(text)) return;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.role === speaker) {
          return [
            ...prev.slice(0, -1),
            { role: speaker, text, timestamp: last.timestamp },
          ];
        }
        return [...prev, { role: speaker, text, timestamp: new Date() }];
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

  sendUserMessageRef.current = conversation.sendUserMessage;
  sendContextualUpdateRef.current = conversation.sendContextualUpdate;

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

      conversation.startSession({
        conversationToken: body.conversationToken,
        connectionType: 'webrtc',
      });
    } catch (err) {
      startingRef.current = false;
      pendingChapterRef.current = null;
      setSessionError(err instanceof Error ? err.message : String(err));
    }
  }, [conversation]);

  const endCall = useCallback(() => {
    startingRef.current = false;
    pendingChapterRef.current = null;
    conversation.endSession();
  }, [conversation]);

  const handleChapterClick = useCallback(
    (id: ChapterId) => {
      setActiveChapter(id);

      if (conversation.status === 'connected') {
        launchChapter(
          id,
          conversation.sendUserMessage,
          conversation.sendContextualUpdate
        );
        return;
      }

      pendingChapterRef.current = id;

      if (conversation.status === 'disconnected') {
        void startCall();
      }
    },
    [conversation, startCall]
  );

  const handleStartFromOrb = useCallback(() => {
    pendingChapterRef.current = null;
    void startCall();
  }, [startCall]);

  const displayError = sessionError ?? conversation.message;

  return (
    <div className="bg-bg-base text-text-primary">
      <ClientToolsRegistrar
        setActiveChapter={setActiveChapter}
        setCvVisible={setCvVisible}
        setReadMode={setReadMode}
      />
      <Hero />
      <section
        aria-label="Voice conversation"
        className="relative flex h-screen min-h-0"
      >
        <Sidebar
          chapters={CHAPTERS}
          active={activeChapter}
          onSelect={handleChapterClick}
        />
        <main className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden">
          <div className="absolute right-8 top-8 z-10">
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
            <>
              <div className="flex min-h-0 flex-1 items-center justify-center px-6 pt-16 lg:px-12">
                <VoiceOrb
                  status={conversation.status}
                  isSpeaking={conversation.isSpeaking}
                  onStart={handleStartFromOrb}
                  onEnd={endCall}
                  errorMessage={displayError}
                />
              </div>
              <div className="flex shrink-0 justify-center px-6 pb-8 pt-2 lg:px-12">
                <Transcript messages={messages} />
              </div>
            </>
          )}
        </main>
      </section>
    </div>
  );
}
