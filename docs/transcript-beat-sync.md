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

## Agent prompt

The system prompt asks Ward to use blank lines between short paragraphs so beats match UI and interruptions are natural.

## ElevenLabs dashboard

No extra client event flags are required for alignment on WebRTC. Optional: enable `agent_response_complete` only if `turn_timeout` is disabled (not used in ask-ward today).
