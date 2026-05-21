# Technical Spec — v2 Features

What to build on top of v1. Does not re-specify hero, sidebar, orb, layout, branding, or mobile — those are already working.

---

## 1. Sub-chapters under each chapter

**What:**
Some chapters have sub-chapters (called "topics" elsewhere — same thing). Sub-chapters appear nested under a parent chapter in the sidebar. Clickable, expandable.

**Behavior:**
- Default: chapters are collapsed, only parent labels visible.
- Click a chapter title → expand to show sub-chapters indented underneath, in smaller type.
- Click a sub-chapter title → set it as active, trigger the matching topic via the same flow as voice navigation.
- Visual: indent ~20px, sub-chapter type one size smaller than parent.

**Data source:**
The `sub_chapters` field on each topic in `02-content-topics.md`. Currently most topics don't have sub-chapters — they're a future structural option, not required for v2 launch.

For v2, the 14 topics live flat in the sidebar. Build the sub-chapter UI primitive so it's ready when content grows.

---

## 2. Text-bubble splitting synced to audio

This is the most important new feature.

**The problem:**
Currently the agent's response appears as one long block of text while audio plays over it. Eye and ear lose sync.

**The solution:**
Each beat (separated by `\n\n` in the topic content) gets its own chat bubble. Bubbles appear at the moment the audio reaches their beat boundary.

**The approach — use ElevenLabs alignment data, not timecodes.**

**Beat delimiter contract:** Beats are separated by a blank line (`\n\n`) in the content file. No special tags, no markers, no SSML. The content is human-readable markdown. The frontend scans the agent's response text for `\n\n` and splits into bubbles at those positions. This keeps the content editable, keeps the agent's spoken output clean (no markers being read aloud), and avoids a separate parsing layer.

ElevenLabs streams `audio` events that include character-level alignment data:

```json
{
  "audio_event": {
    "audio_base_64": "...",
    "event_id": 12345,
    "alignment": {
      "chars": ["H", "e", "l", "l", "o", " ", ...],
      "char_durations_ms": [50, 30, 40, 40, 60, 30, ...],
      "char_start_times_ms": [0, 50, 80, 120, 160, 220, ...]
    }
  }
}
```

**Implementation outline:**

1. The agent's full response text contains `\n\n` between beats (this is how the content is written in `02-content-topics.md`).
2. When the `audio` event arrives, find the character indices of each `\n\n` in the response text.
3. Map those indices to `char_start_times_ms`.
4. Schedule each bubble to appear via `setTimeout` at the matching ms offset, or use the actual audio playback time as the trigger (preferable for accuracy under interruption).
5. The first bubble appears at t=0. Each subsequent bubble at its computed offset.

**Important:** if the user interrupts mid-bubble, listen for the `agent_response_correction` event from ElevenLabs and update the displayed bubbles accordingly. Do not schedule future bubbles past the interruption point.

**If the continuous audio feels disconnected from the bubble pops during testing**, an optional v2.1 enhancement is to add SSML-style `<break time="400ms" />` markers between beats so the audio actually pauses at boundaries. Do not add this preemptively — ship without it first, test, decide. Adding break tags introduces another layer of fragility (silent failures if the tag is dropped, timing drift).

**Reference:** [ElevenLabs Client Events docs](https://elevenlabs.io/docs/eleven-agents/customization/events/client-events) — see the `audio` and `agent_response_correction` events.

---

## 3. Side panel

**What:**
A panel that opens beside the chat area when a topic has supplementary content (links, choice buttons, prompts). Closes when the topic changes or when the user dismisses it.

**Content per topic (from the content file):**
- `links`: 1–3 contextual links (demo, GitHub, write-up, etc.)
- `choices`: clickable buttons that trigger tool calls (e.g., "Connect to Ward on WhatsApp")
- `prompts`: invitations to ask a free-form question (no button, just text)

**Behavior:**
- Opens automatically when a topic with side-panel content becomes active.
- The agent can also call `open_side_panel` mid-conversation if needed.
- Closes when the topic changes (panel content swaps in).
- Dismissable by the user.
- Position: docked to the right of the chat area, or slides in from the right edge.

**Click-or-speak parity:**
Every button in the side panel should also be invokable by voice. If the user says "open the GitHub link" or "connect me to Ward," the agent should call the same tool the button does.

---

## 4. Top-bar profile indicator

**What:**
Once the agent has inferred (or been told) the user's role, surface it in the top bar so the listener can see the agent adapted.

**Display:**
Small pill next to the existing "Open · AI Agent Designer" pill. Reads "Speaking with: Founder" or "Speaking with: Hiring Manager" or "Speaking with: Recruiter."

**Trigger:**
The agent calls `set_role(role)`. Frontend updates the pill.

**Default:**
Hidden until a role is set. Do not show "Speaking with: Unknown."

---

## 5. Transcript view toggle

**What:**
A small toggle (probably in the top-right or in the sidebar header) that switches the chat area between voice-with-bubbles mode and full-transcript mode.

**Why:**
Accessibility (deaf/hard of hearing, audio-off environments).

**Behavior:**
- When enabled, the chat area shows all spoken beats as text, in order, even past topics.
- Audio still plays (unless the user has muted separately).
- Each bubble still appears synchronized to its audio beat.

This is a UI concern, not a data concern — the bubbles are already text.

---

## 6. Visited-chapter fading

**What:**
Once a chapter has been listened to (any portion of it spoken), fade its label in the sidebar to indicate it has been visited.

**Style:**
Reduce opacity to ~50%. Still clickable for re-listen.

**Reset:**
On page refresh, all chapters reset to unvisited. (Optional: persist visited state in localStorage if you want resume-across-reloads.)

---

## 7. "Open Mic" label change

**What:**
The chapter currently labeled "Ask Anything" becomes "Open Mic."

Trivial change. Update the label only. Behavior unchanged.

---

## 8. Sound effects

**What:**
Subtle audio cues for interface events. The listener already has audio on for the agent, so adding small UI sounds is natural.

**Where:**
- Chapter button click → soft click
- Side panel open/close → soft whoosh
- Beat boundary (new bubble appears) → optional very-subtle tick
- Orb state change (idle ↔ listening ↔ speaking) → soft tone shift

**Constraints:**
- Sparingly. If any sound competes with the agent's voice, it is too loud.
- Mutable independently from the agent voice.
- Framework: Ward has done tests and will provide the framework / sample files. Implement against that.

**Logged as awaiting Ward's framework details.**

---

## 9. Self-portrait inside the orb

**What:**
When the agent is active or listening, fade a B&W self-portrait of Ward into the orb shape. When idle, return to the abstract orb.

**Style:**
- Circular crop, head-and-shoulders.
- B&W, optionally with a halftone or engraving treatment to match the brand aesthetic.
- Slight transparency / sage tint so the orb still reads as the orb.

**Trigger:**
Agent state changes. Idle → abstract orb. Active or listening → portrait inside orb.

---

## 10. WhatsApp escape hatch

**What:**
When the agent cannot answer or the user wants to escalate, surface a button to connect to Ward directly via WhatsApp.

**Mechanism:**
- The `connect_to_ward` tool call is invoked by the agent.
- Frontend opens the side panel with a single primary button: "Connect to Ward on WhatsApp."
- Button opens `https://wa.me/<Ward's number>` in a new tab.

**Ward to provide:** WhatsApp link / number.

---

## 11. Unified navigation state

**Architectural rule:**
There is one "select topic" function in the frontend. Both the chapter button click handler and the `navigate_to_topic` tool call invoke it.

**Why:**
If the user says "skip to MoMuse," the sidebar should highlight MoMuse exactly as if they had clicked it. If the user clicks MoMuse, the agent should respond exactly as if it had been asked.

**Implementation:**
- Single `selectTopic(topic_id)` function in app state.
- Both UI click and tool-call event call this function.
- It updates active state, opens the side panel, triggers the agent's response (if not already speaking).

---

## 12. Stricter agent behavior

Covered in `03-system-prompt.md`. Summary:

- Low temperature (0.2–0.4)
- High stability
- System prompt with explicit "do not invent" rules
- ElevenLabs guardrails enabled
- `connect_to_ward` fallback for off-script questions

---

## To-Do / To-Test list

Things to verify or come back to. Not blocking v2 launch but worth tracking.

### To test before launch
- [ ] Interruption flag in ElevenLabs actually works mid-beat without breaking bubble sync
- [ ] Audio-text sync feels natural (not eerie) under varied beat lengths
- [ ] Off-script behavior holds — agent does not invent when probed
- [ ] Voice profile feels right for the reflective register
- [ ] Sound effects do not collide with speech
- [ ] Sub-chapter UI primitive works when content adds sub-chapters
- [ ] Click navigation and tool-call navigation produce identical UI state
- [ ] Top-bar profile indicator updates quietly without disrupting flow
- [ ] Transcript toggle preserves bubble order and timing
- [ ] WhatsApp link opens correctly across browsers

### To consider for v3
- [ ] Language switch (English input → auto-translated EU outputs)
- [ ] Beat/chapter counter linked to analytics (Plausible)
- [ ] Knowledge graph for response generation
- [ ] Role-adaptive content variants per topic (only if testing shows we need them)
- [ ] Resume across reloads (localStorage)
- [ ] Re-listen / restart of a single beat
- [ ] Inferred-role override (user manually corrects the agent's inference)

### Won't address in v2
- Hero / sidebar / orb geometry (v1)
- Layout / branding (already decided)
- Mobile (works well enough)

---

## Documentation linkage

- This spec lives in the project documentation (Notion-linked).
- Code state lives in the GitHub repository (knowledge graph of the coding agent).
- Content source of truth: `02-content-topics.md` in this package, eventually mirrored into the agent's ElevenLabs knowledge base.
- System prompt source of truth: `03-system-prompt.md` in this package, eventually pasted into the ElevenLabs agent configuration.

When content changes, update `02-content-topics.md` and resync the agent knowledge base. When prompt rules change, update `03-system-prompt.md` and resync the ElevenLabs agent configuration.
