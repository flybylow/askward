'use client';

import { useCallback, useState } from 'react';
import { useConversation } from '@elevenlabs/react';
import { CHAPTERS } from '@/lib/chapters';
import type { ChapterId } from '@/lib/client-tools';
import {
  shouldShowTranscriptLine,
  stripToolCallMarkup,
} from '@/lib/transcript';
import { ClientToolsRegistrar } from '@/components/ClientToolsRegistrar';
import { Sidebar } from '@/components/Sidebar';
import { VoiceOrb } from '@/components/VoiceOrb';
import { Transcript, type TranscriptMessage } from '@/components/Transcript';
import { ReadMode } from '@/components/ReadMode';
import { CVDownload } from '@/components/CVDownload';
import { GilliamCutout } from '@/components/GilliamCutout';

export function ConversationShell() {
  const [activeChapter, setActiveChapter] = useState<ChapterId>('intro');
  const [cvVisible, setCvVisible] = useState(true);
  const [readMode, setReadMode] = useState(false);
  const [messages, setMessages] = useState<TranscriptMessage[]>([]);
  const [sessionError, setSessionError] = useState<string>();

  const conversation = useConversation({
    onMessage: ({ message, role, source }) => {
      const speaker = role ?? (source === 'user' ? 'user' : 'agent');
      const text = stripToolCallMarkup(message);
      if (!shouldShowTranscriptLine(text)) return;

      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.role === speaker) {
          return [...prev.slice(0, -1), { role: speaker, text }];
        }
        return [...prev, { role: speaker, text }];
      });
    },
    onUnhandledClientToolCall: (call) => {
      console.warn('[ask-ward] Unhandled client tool:', call.tool_name, call);
    },
    onAgentToolRequest: (req) => {
      console.debug('[ask-ward] Agent tool request:', req);
    },
    onError: (err) => {
      console.error('Conversation error', err);
      setSessionError(typeof err === 'string' ? err : 'Connection error');
    },
  });

  const startCall = useCallback(async () => {
    setSessionError(undefined);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setSessionError('Microphone access is required for voice mode.');
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
      await conversation.startSession({
        conversationToken: body.conversationToken,
        connectionType: 'webrtc',
      });
    } catch (err) {
      setSessionError(err instanceof Error ? err.message : String(err));
    }
  }, [conversation]);

  const endCall = useCallback(() => {
    conversation.endSession();
  }, [conversation]);

  const handleChapterClick = useCallback(
    (id: ChapterId) => {
      setActiveChapter(id);
      if (conversation.status === 'connected') {
        const label = CHAPTERS.find((c) => c.id === id)?.label ?? id;
        conversation.sendContextualUpdate(
          `The user clicked on the "${label}" chapter (${id}) in the sidebar. Acknowledge briefly and enter that chapter. Remember to call highlightChapter with chapterId "${id}".`
        );
      }
    },
    [conversation]
  );

  return (
    <div className="min-h-screen bg-paper text-ink">
      <ClientToolsRegistrar
        setActiveChapter={setActiveChapter}
        setCvVisible={setCvVisible}
        setReadMode={setReadMode}
      />

      <div className="mx-auto max-w-6xl px-6 py-10 md:px-10 md:py-14 lg:py-16">
        {/* Header */}
        <header className="flex items-start justify-between gap-8">
          <div>
            <h1 className="font-heading text-[clamp(2.75rem,6vw,4.5rem)] leading-[0.95] tracking-[-0.02em] text-ink">
              Ask Ward
            </h1>
            <p className="mt-3 font-body text-sm text-ink/50">
              Open · AI Agent Designer
            </p>
          </div>
          <CVDownload visible={cvVisible} />
        </header>

        {/* Asymmetric hero — chapters left, orb + cutout right */}
        <div className="mt-14 grid items-start gap-12 lg:mt-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-16 xl:gap-24">
          <Sidebar
            chapters={CHAPTERS}
            active={activeChapter}
            onSelect={handleChapterClick}
          />

          <section className="flex flex-col items-center gap-10 lg:items-end lg:pt-2">
            {readMode ? (
              <ReadMode chapterId={activeChapter} onExit={() => setReadMode(false)} />
            ) : (
              <>
                <div className="relative flex w-full max-w-md items-center justify-center lg:justify-end">
                  <GilliamCutout className="absolute -left-2 top-1/2 z-0 h-56 w-44 -translate-y-[58%] opacity-90 sm:-left-6 sm:h-64 sm:w-52 lg:-left-10 lg:h-72 lg:w-56" />
                  <div className="relative z-10 lg:mr-8">
                    <VoiceOrb
                      status={conversation.status}
                      isSpeaking={conversation.isSpeaking}
                      onStart={startCall}
                      onEnd={endCall}
                      errorMessage={sessionError}
                    />
                  </div>
                </div>
                <Transcript messages={messages} />
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
