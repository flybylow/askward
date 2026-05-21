# Open Application — Voice Agent v2

**For:** Developer working on the next iteration of the voice-agent application site.
**From:** Ward, via the design/content sprint with Emma (creative director).
**Status:** Update to v1, not a full rebuild.

---

## What's already built (v1)

The hero zone, sidebar, orb, and chat shell are working. Voice is wired through ElevenLabs Conversational AI. Interruption is enabled.

**Do not re-spec:** hero geometry, sidebar layout, orb behavior, layout/branding, mobile.

---

## What this package contains

| File | Purpose |
|---|---|
| `01-overview.md` | This file. Reading order, status, scope. |
| `02-content-topics.md` | All 14 spoken topics, beat by beat. Source of truth for the agent knowledge base. |
| `03-system-prompt.md` | ElevenLabs agent system prompt. Identity, voice, guardrails, tool-calling logic. |
| `04-technical-spec.md` | New features for v2: sub-chapters, audio-text sync, side panel, sound effects, navigation, escape hatch, to-do list. |

---

## v2 — what's new

1. **14 topics with structured beat content** (replaces v1's long-form chapter scripts).
2. **Sub-chapters** under each chapter, clickable and expandable in the sidebar.
3. **Text-bubble splitting** synced to audio playback per beat (using ElevenLabs alignment data, not timecodes).
4. **Side panel** opens per topic with contextual links and optional clickable choice buttons.
5. **Top-bar profile indicator** that surfaces the active role mode once detected.
6. **Transcript view toggle** for accessibility.
7. **Visited-chapter fading** in the sidebar.
8. **"Open Mic"** replaces "Ask Anything" as the final chapter label.
9. **Sound effects** for chapter clicks, panel transitions, beat transitions, orb state changes (sparingly, framework TBD).
10. **Self-portrait in the orb** when the agent is active/listening.
11. **WhatsApp escape hatch** for off-script questions.
12. **Stricter agent guardrails** — system prompt + low temperature + ElevenLabs guardrails.
13. **Unified navigation state** — clicking a chapter button and the `navigate_to_topic` tool both trigger the same state action.

---

## Out of scope for v2

- Language switch (English input → auto-translated EU outputs). v3.
- Beat/chapter analytics counter linked to knowledge graph. v3.
- Role-adaptive content variants per topic. We're starting with one universal voice and will only add variants if testing shows we need them.

---

## Reading order

1. Read this overview.
2. Read `04-technical-spec.md` for the architecture.
3. Read `03-system-prompt.md` for the agent's identity and behavior rules.
4. Use `02-content-topics.md` as the data file that gets loaded into the agent's knowledge base.

---

## Notes on voice and tone

The content is written for spoken delivery, not for reading. Specifically:

- **First person Ward.** The agent speaks as Ward, not about Ward.
- **Short sentences.** Periods, not em-dashes. Real spoken English uses pauses, not punctuation acrobatics.
- **No AI tells.** No "real X, real Y" patterns. No closing aphorisms. No restating the previous sentence in different words.
- **Beats separated by `\n\n`.** This is the delimiter used for bubble splitting on the frontend.
- **No year-number flexing.** "Twenty years" appears once in the hero subhead. In spoken content, use "over my career" or "over time" instead.
