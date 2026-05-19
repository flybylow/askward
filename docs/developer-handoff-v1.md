# ask-ward — Developer Handoff (v1)

A voice-based application for the **Open (YC W24) AI Agent Designer** role.

The recruiter visits `ask.tabulas.eu`, sees a sidebar of chapters, clicks one, and has a voice conversation with Ward's AI agent. Sidebar is bidirectional: the agent highlights what it's discussing.

Related docs:

- [elevenlabs-system-prompt.md](./elevenlabs-system-prompt.md) — full system prompt for ElevenLabs
- [elevenlabs-chapters-knowledge-base.md](./elevenlabs-chapters-knowledge-base.md) — chapter content for ElevenLabs knowledge base
- [api-conversation-token.md](./api-conversation-token.md) — WebRTC token route (implementation detail)

---

## Stack & decisions (locked)

| Decision | Choice |
| --- | --- |
| Framework | Next.js 15, App Router, TypeScript |
| Styling | Tailwind + shadcn/ui |
| Voice SDK | `@elevenlabs/react` (NOT `@11labs/react`, that's the old name) |
| Connection | WebRTC (default for voice in current SDK) |
| Backend | Vercel serverless route (`/api/conversation-token`) |
| Hosting | Vercel, custom domain `ask.tabulas.eu` |
| Repo | `flybylow/ask-ward` |
| Persona | First-person Ward |
| Voice | Stock ElevenLabs voice (Ward picks in ElevenLabs UI) |
| Bidirectional sidebar | Yes — agent calls `highlightChapter` client tool |
| CV | Embedded download + linked to ElevenLabs knowledge base |
| Backup mode | Read mode — each chapter has pre-written text |

V2 (not now): voice cloning, Calendly tool, observability.

V3 (not now): TicketSwap or Mollie case-study agent.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  Browser (ask.tabulas.eu)                           │
│  ┌───────────────────────────────────────────────┐  │
│  │  Next.js + @elevenlabs/react                  │  │
│  │  ConversationProvider                         │  │
│  │  ├── Sidebar (9 chapters, click → context)    │  │
│  │  ├── VoiceOrb (idle/listening/speaking)       │  │
│  │  ├── Transcript                               │  │
│  │  └── CV download + ReadMode toggle            │  │
│  │  clientTools: { highlightChapter, showCV,     │  │
│  │                 switchToReadMode }            │  │
│  └───────────────────────────────────────────────┘  │
│         │ 1. GET /api/conversation-token            │
│         │ 2. WebRTC ←──────────────────────────────┐│
└─────────┼────────────────────────────────────────────┘
          │                                            │
          ▼                                            │
┌─────────────────────────┐                            │
│  Vercel serverless      │                            │
│  /api/conversation-token│                            │
│  fetch → ElevenLabs     │                            │
│  with XI_API_KEY        │                            │
│  returns token          │                            │
└──────────┬──────────────┘                            │
           │                                           │
           ▼                                           │
┌─────────────────────────────────────────────────────┐
│  ElevenLabs Conversational AI                       │
│  Agent: "Ward"                                      │◄┘
│  Voice: <Ward picks>                                │
│  System prompt: see elevenlabs-system-prompt.md     │
│  Knowledge base: CV + chapter content               │
│  Tools (client-side declarations): see below        │
└─────────────────────────────────────────────────────┘
```

**Key fact:** the browser opens WebRTC directly to ElevenLabs. The Vercel function only mints the conversation token. Don't try to proxy audio through Vercel.

---

## File structure

```
ask-ward/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # wraps in ConversationProvider
│   │   ├── page.tsx                # main app shell
│   │   ├── globals.css
│   │   └── api/
│   │       └── conversation-token/
│   │           └── route.ts        # GET → conversation token from ElevenLabs
│   ├── components/
│   │   ├── Sidebar.tsx             # 9 chapters
│   │   ├── VoiceOrb.tsx            # central voice UI
│   │   ├── Transcript.tsx          # live captions
│   │   ├── ReadMode.tsx            # text-only fallback
│   │   ├── CVDownload.tsx          # header button
│   │   └── ConversationShell.tsx   # holds useConversation + tool wiring
│   ├── lib/
│   │   ├── chapters.ts             # chapter metadata + read-mode text
│   │   └── client-tools.ts         # tool implementations
│   └── public/
│       ├── cv-ward.pdf             # 🟡 WARD: drop your CV here
│       └── screenshots/            # 🟡 WARD: voice-to-blockchain shots later
└── README.md
```

---

## Client tools (the bidirectional layer)

These are the functions the agent can invoke in the browser. Define them in the React code AND mirror their schema in the ElevenLabs UI (Agent → Tools).

```ts
// src/lib/client-tools.ts

export type ChapterId =
  | 'intro' | 'agent-experience' | 'why-open' | 'tabulas-deep'
  | 'customer-facing' | 'prompt-engineering' | 'design-history'
  | 'logistics' | 'ask-anything';

export type ClientToolsState = {
  setActiveChapter: (id: ChapterId) => void;
  setCvVisible: (visible: boolean) => void;
  setReadMode: (on: boolean) => void;
};

export const makeClientTools = (state: ClientToolsState) => ({

  highlightChapter: ({ chapterId }: { chapterId: ChapterId }) => {
    state.setActiveChapter(chapterId);
    return 'Chapter highlighted';
  },

  showCVDownload: () => {
    state.setCvVisible(true);
    return 'CV download surfaced';
  },

  switchToReadMode: () => {
    state.setReadMode(true);
    return 'Switched to read mode';
  },

});
```

### ElevenLabs UI: matching tool definitions

🟡 WARD: in the ElevenLabs agent settings, under **Tools**, create three **Client tools** (not server tools) with these exact names + schemas:

1. **`highlightChapter`** — "Visually highlight the chapter the user is currently learning about in the sidebar. Call this whenever the conversation enters a new chapter topic."
   - Parameters: `chapterId` (string, required, one of: `intro`, `agent-experience`, `why-open`, `tabulas-deep`, `customer-facing`, `prompt-engineering`, `design-history`, `logistics`, `ask-anything`)
   - **Blocking:** No (fire and forget, do not wait for response)

2. **`showCVDownload`** — "Surface Ward's CV download button. Call when the user explicitly asks for the CV, resume, work history, or to see Ward's experience in writing."
   - Parameters: none
   - Blocking: No

3. **`switchToReadMode`** — "Switch the interface from voice mode to text mode. Call only when the user explicitly asks to read instead of listen, or mentions they can't use audio."
   - Parameters: none
   - Blocking: No

The "blocking" flag matters: blocking tools pause the agent until the client returns. None of these need to block.

---

## API route note

The original handoff specified `GET /api/signed-url` returning a signed URL for `startSession({ signedUrl, connectionType: 'webrtc' })`.

In `@elevenlabs/react` / `@elevenlabs/client` (v1.6+):

- **`signedUrl`** → WebSocket only
- **`conversationToken`** → WebRTC

This repo implements `GET /api/conversation-token` instead. See [api-conversation-token.md](./api-conversation-token.md) for the full route and client wiring.

---

## Ward's TODOs (do these in order)

### Before first deploy

1. 🟡 **Drop CV PDF** in `src/public/cv-ward.pdf`. Use the Tabulas-positioned variant if you make one (see optional CV note in full handoff), otherwise the current one is fine for v1.
2. 🟡 **Create ElevenLabs agent**:
   - Go to elevenlabs.io → Agents → Create agent
   - Name: "Ward"
   - Voice: pick one. Recommendation: try "Adam" or "Bill" for a natural male English voice. Test 2-3 before deciding.
   - LLM: GPT-4o or Claude Sonnet (whichever ElevenLabs offers in their dropdown). Start with GPT-4o.
   - Temperature: 0.6 (lower = more consistent, higher = more natural)
   - First message: paste the "First message" from [elevenlabs-system-prompt.md](./elevenlabs-system-prompt.md)
   - System prompt: paste the full prompt from [elevenlabs-system-prompt.md](./elevenlabs-system-prompt.md)
   - Knowledge base: paste [elevenlabs-chapters-knowledge-base.md](./elevenlabs-chapters-knowledge-base.md) as a single document, attach the CV PDF
   - Tools: create the 3 client tools per Client tools section above
   - Get the **Agent ID** → paste into `NEXT_PUBLIC_ELEVENLABS_AGENT_ID`
   - Get an **API key** (Settings → API keys) → paste into `ELEVENLABS_API_KEY`
3. 🟡 **Test locally** with `npm run dev`. Open `localhost:3000`, click any chapter, hear agent respond, watch sidebar highlight sync.
4. 🟡 **Deploy to Vercel** (`vercel` or via git push). Add env vars in Vercel project settings.
5. 🟡 **Configure DNS**: point `ask.tabulas.eu` CNAME to `cname.vercel-dns.com` (or whatever Vercel shows in domains tab).

### After first deploy

6. 🟡 Test on phone (recruiters open links on mobile). Check mic permissions flow on iOS Safari specifically.
7. 🟡 Test what happens if the user interrupts the agent mid-sentence. ElevenLabs handles this by default but verify it feels right.
8. 🟡 Add voice-to-blockchain screenshots to `/public/screenshots/` and update the agent's knowledge base entry for `agent-experience` with a link.

### Polish (after content is in)

9. 🟡 Replace placeholder readModeText in `chapters.ts` with real text from [elevenlabs-chapters-knowledge-base.md](./elevenlabs-chapters-knowledge-base.md) short versions.
10. 🟡 Decide if you want analytics. PostHog or Vercel Analytics, just to see which chapters get clicked.

---

## Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Latency feels slow | ElevenLabs default is fast. If sluggish, switch to a turbo model in their UI. |
| Agent hallucinates a fact (e.g. wrong hackathon prize) | The system prompt has "Things you don't know — be honest" section. Test with 5 hard questions before sharing. |
| Recruiter can't use audio | Read mode is the fallback. Make sure it's discoverable (the agent itself mentions it on intro). |
| Recruiter on mobile, can't grant mic | Read mode + CV download cover this. |
| Agent overruns response length | If responses regularly exceed 30 seconds, add "RESPONSE LENGTH: keep under 60 words spoken" near the top of the system prompt. |
| ElevenLabs outage on the day | Read mode works without ElevenLabs. The agent is unavailable, the text is still there. |
