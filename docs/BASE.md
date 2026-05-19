# Docs conventions (ask-ward)

- Internal knowledge lives in `docs/` only. Root keeps a single `README.md` plus app code.
- **`docs/INDEX.md`** is the table of contents; update it when adding or renaming docs.
- **`docs/BASE.md`** (this file) records project-wide doc rules.
- File names: `kebab-case.md` or `YYYY-MM-DD-topic.md` when dated.
- Ward-specific setup steps are tagged **WARD** in docs and README.

## Stack (v1)

Next.js App Router, TypeScript, Tailwind, shadcn/ui, `@elevenlabs/react`, Vercel, domain `ask.tabulas.eu`.

## ElevenLabs auth note

WebRTC requires a **conversation token** from `/api/conversation-token`, not a signed URL (signed URLs are WebSocket-only in the current SDK). See `docs/api-conversation-token.md`.
