# B — Hero + Interface Merge (v2, authoritative)

**Status:** Latest. Supersedes the v1 split-zone layout (separate hero zone + agent zone stacked vertically).

**Audience:** Cursor / developer.

---

## The change

V1 had two stacked zones: hero on top (pitch, image, no interaction), agent zone below (orb, chat, sidebar). The listener scrolled or scanned past the hero to use the agent.

V2 merges them. The hero image *is* the agent. One viewport, one experience. The microphone collage on the right is the visual anchor; the orb takes its place when the conversation is active. The sidebar stays on the left. The chat bubbles flow below.

---

## Layout

One screen, no scrolling required for the conversation surface.

```
┌─────────────────────────────────────────────────────────────────┐
│  TALK TO WARD                                                   │
│  Click any chapter, or just ask.                                │
│                                                                 │
│  Hello                                                          │
│  Why Open                            ┌──────────────────────┐  │
│  About Ward                          │   [collage frame]    │  │
│  What I've built                     │                      │  │
│  Practical                           │  [microphone OR orb] │  │
│                                      │                      │  │
│                                      └──────────────────────┘  │
│                                       Click to start            │
│                                                                 │
│                                       ┌────────────────────┐   │
│                                       │  chat bubble 1     │   │
│                                       └────────────────────┘   │
│                                       ┌────────────────────┐   │
│                                       │  chat bubble 2     │   │
│                                       └────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

The collage frame (sage circle, copper rectangle, halftone dots, engraved flourishes) is **persistent**. The element *inside* it swaps based on state.

---

## States

### State 1 — Idle (default on page load)

The hero collage is fully visible. Microphone sits centered inside the sage circle. Subtle idle animations:

- **Parallax on cursor move.** Microphone shifts ~3px in the opposite direction of the cursor. Sage circle and copper rectangle stay still. Creates a sense of depth.
- **Halftone dot breathing.** The dotted pattern in the top-right corner gently fades opacity between ~80% and ~100% on a slow 4-second cycle. Just a hint of breath.

No audio activity. Cursor over the "Click to start" prompt or the orb area shows a clickable cursor.

### State 2 — Activation (click "Click to start" or "Talk to Me")

Fast transition (200-300ms total):

1. Microphone fades out (opacity 1 → 0)
2. Orb fades in simultaneously (opacity 0 → 1), positioned inside the sage circle exactly where the microphone was
3. ElevenLabs conversation begins, agent speaks the greeting

The sage circle, copper rectangle, halftone dots, flourishes — all stay. Only the centerpiece swaps.

### State 3 — Active (conversation in progress)

The orb is doing its audio-reactive thing inside the sage circle. ElevenLabs SDK drives it directly.

Surrounding collage elements stay in their idle ambient state (parallax on cursor, dots breathing). They do NOT react to audio.

Chat bubbles appear below the collage as the agent speaks, synced to audio per the beat-bubble system in `04-technical-spec.md`.

### State 4 — End of conversation / reset

Reverse the activation transition:

1. Orb fades out (opacity 1 → 0)
2. Microphone fades in simultaneously (opacity 0 → 1)
3. Back to State 1

Chat bubbles remain visible until the user navigates away or refreshes.

---

## Why Path C and not full microphone-as-orb

The microphone could in theory be audio-reactive itself — a Gilliam-style paper-cut visualizer that wobbles and pulses with the audio amplitude. That would be the boldest move and the most on-brand.

But it requires rebuilding ElevenLabs' visualization layer from scratch in a custom Gilliam aesthetic. That's a real engineering investment (~a week of work to do well).

Path C avoids that. The ElevenLabs orb component stays as-is. The microphone is just an idle-state visual that fades out when the orb takes over. No custom audio visualization needed. Snappier to build, lower risk.

**Note for future:** if v3 has time, the full microphone-as-audio-reactive integration (Path A) is worth revisiting. The current spec is the v2 compromise.

---

## Sizing and positioning

- The collage frame occupies roughly the right 40-45% of the viewport, vertically centered or slightly above center.
- The sage circle is roughly 320px diameter on desktop.
- The microphone fills ~70% of the sage circle's interior.
- The orb, when active, sits at the same center as the microphone, sized to fit inside the sage circle with similar visual weight (~60-70% of the circle's interior).
- The copper rectangle, halftone dots, and flourishes bleed off the right and top edges of the viewport.
- Chat bubbles appear directly below the collage frame, max-width ~600px, aligned with the right edge of the sage circle.

---

## Chat bubble container

Important fix from the current screenshot: bubbles are running off the right edge of the viewport.

Set the bubble container to:
- Max-width: 600px
- Right-aligned with the orb's vertical centerline
- Padding: 16px between bubbles
- Each bubble: rounded corners (8-12px), light gray background (`#F2F2F0`), 16px text, 16-20px internal padding
- Bubbles appear one at a time as audio reaches each beat boundary (per the beat-sync logic in `04-technical-spec.md`)

---

## Transitions — animation values

Use these as starting defaults; tune in browser:

| Transition | Duration | Easing |
|---|---|---|
| Microphone ↔ orb fade | 250ms | ease-out |
| Parallax response to cursor | 400ms | ease-out |
| Halftone dot opacity breathing | 4000ms loop | ease-in-out |
| Chat bubble fade-in | 200ms | ease-out |

All fast. The page should feel responsive, not animated. Animation is texture, not feature.

---

## What this replaces in v1

- The vertical stacking of hero zone + agent zone. They are now one merged surface.
- The separate "Click to start" prompt floating below the orb in v1 — now lives below the merged collage/orb.
- Any "scroll down to interact" affordance — gone. The interaction surface is the hero.

---

## Out of scope for v2

- **Custom Gilliam-style audio-reactive microphone (Path A).** Defer to v3.
- **Audio-reactive halftone dots.** Defer. Dots stay on their slow ambient breathing only.
- **Stop-motion frame-by-frame Gilliam animation of the collage.** Defer. Idle parallax + dot breathing is enough for v2.
- **Morph transition from microphone to orb.** Defer. Use simple fade for v2.

---

## Implementation order (suggested)

1. Fix the chat bubble container max-width and alignment (immediate, the screenshot shows this bug)
2. Position the existing orb inside the sage circle of the hero image (CSS positioning, no new components)
3. Add the show/hide logic — microphone visible by default, orb visible when conversation is active
4. Add the fade transitions between the two states
5. Add the idle parallax on cursor (vanilla JS or a lightweight library like react-parallax-mouse)
6. Add the halftone dot breathing (CSS animation, no JS needed)
7. Wire activation: clicking "Click to start" or clicking the microphone area triggers state change
8. Wire end-of-conversation reset back to idle state

Each step is independently testable. If step 4's transitions feel wrong, you can iterate without unwinding steps 1-3.

---

## Implementation addendum (May 2026)

**Hero portrait + wax seal + voice collage frame** live in one `CollageStage` box (`aspect-[571/1024]`, `w-[min(42vw,480px)]`). All layers use **% positioning inside that box** so they scale together — no separate viewport-sized overlays.

**Hero intro copy** (headline, subhead) renders as the first two agent bubbles in the left-column transcript when idle; live messages replace them once the conversation starts. Badge + “Talk to me” sit above the transcript. Collage/orb stays on the right. See `HeroIntro.tsx`, `Transcript.tsx`, `HeroBackdrop.tsx`, and `CollageStage.tsx`.
