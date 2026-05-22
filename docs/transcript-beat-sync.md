# Transcript beat sync (ElevenLabs alignment)

## What ElevenLabs provides

From [Client events](https://elevenlabs.io/docs/eleven-agents/customization/events/client-events):

| Event | Role |
|--------|------|
| `agent_response` | Full agent text, sent with the **first audio chunk** (`onMessage` in React SDK). |
| `audio` + `alignment` | `chars`, `char_start_times_ms`, `char_durations_ms` for TTS sync (`onAudioAlignment` in React SDK). |
| `agent_response_correction` | Truncated text after user interruption. |
| `agent_chat_response_part` | Streaming `start` / `delta` / `stop` — **text-only** mode; not relied on for WebRTC voice. |

Over **WebRTC**, audio plays via LiveKit; alignment still arrives on `onAudioAlignment`.

## What ask-ward does

1. **`splitBeats()`** — split on `\n\n`, then split any paragraph longer than ~280 characters on sentence boundaries so bubbles stay interruptible.
2. **First paragraph** — shown when `onMessage` fires (with the full script).
3. **Later paragraphs** — timed with `char_start_times_ms` from alignment, minus elapsed time since the turn started (alignment is relative to audio t=0).
4. **Fallback** — if alignment for beat 2 is not ready within ~900ms, per-paragraph word-count timing (~170 wpm).
5. **Interruption** — `onInterruption` + `onAgentResponseCorrection` cancel timers and update bubbles.

## Session start order (why early bubbles can be missing)

Typical sidebar / welcome-card connect:

1. `startSession` (optional `initial_chapter` dynamic variable).
2. `onConnect` — sets `awaitingChapterSpeechRef`, queues `pendingLaunchNavRef`.
3. `status === connected'` — `deliverConnectNav` sends `[nav]` contextual update (not shown in transcript).
4. `onMessage` (agent) — ElevenLabs dashboard **First message** may fire first; suppressed while `awaitingChapterSpeechRef` or `skipAgentFirstMessageRef`.
5. `onMessage` (agent) — chapter script; `startAgentTurn` → beat 0 in transcript, further beats via alignment / fallback.
6. `onAudioAlignment` — schedules beats 2+ for the same turn.

**Past bug:** step 4 set `greetingPlayedRef` when skipping, so step 4 could run twice (two generic chunks) and both were dropped; chapter speech in step 5 was the first visible bubble (“picks up later”). **Fix:** keep suppressing generics only while `awaitingChapterSpeechRef`, and show beat 0 in the same `setMessages` update that clears the prior agent turn.

## Agent prompt

The system prompt asks Ward to use blank lines between short paragraphs so beats match UI and interruptions are natural.

## ElevenLabs dashboard

No extra client event flags are required for alignment on WebRTC. Optional: enable `agent_response_complete` only if `turn_timeout` is disabled (not used in ask-ward today).

## LiveKit console noise

`Unknown DataChannel error on lossy {}` comes from LiveKit inside ElevenLabs WebRTC (often on end call or dev hot reload). It is not a Next.js bug. `src/lib/suppress-livekit-console-noise.ts` filters that message at app startup.
