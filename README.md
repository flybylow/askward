# ask-ward

Voice application for the [Open](https://open.cx) (YC W24) AI Agent Designer role. Recruiters visit **ask.tabulas.eu**, pick a chapter, and talk to Ward's ElevenLabs agent. The sidebar highlights the active chapter when the agent calls `highlightChapter`.

## Quick start

```bash
npm install
cp .env.example .env.local
# Add ELEVENLABS_API_KEY and NEXT_PUBLIC_ELEVENLABS_AGENT_ID
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

| Variable | Where | Purpose |
| --- | --- | --- |
| `ELEVENLABS_API_KEY` | Server only | Mints WebRTC conversation token |
| `NEXT_PUBLIC_ELEVENLABS_AGENT_ID` | Client + server | Agent ID from ElevenLabs UI |

## Ward TODOs (before deploy)

1. **CV** — Add `public/cv-ward.pdf`
2. **ElevenLabs agent** — System prompt, knowledge base, and client tools from `docs/elevenlabs-*.md`
3. **Env on Vercel** — Same vars as `.env.local`
4. **DNS** — `ask.tabulas.eu` → Vercel

Full checklist: `docs/developer-handoff-v1.md`.

## Docs

See [`docs/INDEX.md`](./docs/INDEX.md).

## Repo

Target: `flybylow/ask-ward` on GitHub.
