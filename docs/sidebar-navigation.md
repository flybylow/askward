# A — Sidebar Navigation Spec (v2, authoritative)

**Status:** Latest. Supersedes earlier sidebar specs (the three-layer version with Background/AI work/Voice apps subgroups is obsolete).

**Audience:** Cursor / developer working on the React app.

---

## The structure

Five main chapters. One of them (`what-ive-built`) has four sub-items. The other four are flat.

```
TALK TO WARD
Click any chapter, or just ask.

  Intro                          ← chapter (no children, auto-plays on first activation)
  Why Open                       ← chapter (no children)
  About Ward                     ← chapter (no children)
  What I've built                ← chapter (with children)
      MoMuse                     ← sub-item (chronologically first)
      Talk to the product        ← sub-item (second)
      Pawn Shop                  ← sub-item (third)
      This agent                 ← sub-item (fourth, current)
  Practical                      ← chapter (no children)
```

That's it. **Two layers maximum.** No three-level nesting. No sub-sub-items anywhere.

---

## Chapter IDs (used by the `navigate_to_topic` tool)

These must match exactly. The ElevenLabs agent will only call the tool with these strings:

| Sidebar label | Chapter id | Has sub-items? |
|---|---|---|
| Intro | `intro` | no |
| Why Open | `why-open` | no |
| About Ward | `about-ward` | no |
| What I've built | `what-ive-built` | yes |
| Practical | `practical` | no |

### Sub-item IDs (under `what-ive-built`)

| Sidebar label | Sub-item id |
|---|---|
| MoMuse | `momuse` |
| Talk to the product | `talk-to-product` |
| Pawn Shop | `pawn-shop` |
| This agent | `this-agent` |

Sub-items are **not** in the agent's `navigate_to_topic` enum for now. They are visual-only navigation in the sidebar for the listener to scroll/jump within the `what-ive-built` chapter. If we later want the agent to navigate to a specific sub-item, we extend the enum then.

---

## Default state (no chapter active yet)

When the page first loads, before the listener has clicked anything or activated the orb:

- All five main chapters are visible in the sidebar
- All sub-items are **collapsed** (the four voice apps are not visible)
- No chapter has the active highlight
- Greeting message plays from the orb when activated

---

## Active state behavior

When a chapter becomes active (either by sidebar click or by the agent calling `navigate_to_topic`):

1. The matching main chapter gets the active highlight (sage accent on the label, sage indicator bar on the left edge)
2. **If that chapter has sub-items, the sub-items appear underneath, indented**
3. All other main chapters remain visible but show **only the parent label** — their sub-items (if any) stay collapsed

When the active chapter changes:

1. The previous active chapter's sub-items collapse back
2. The new active chapter's sub-items expand (if it has any)
3. The active highlight moves

Only one chapter is ever in the "expanded" state at a time. There is no manual expand/collapse arrow. The expansion follows the active state automatically.

---

## Visited state (optional, can skip for v2 if it adds complexity)

After a chapter has been listened to (any portion spoken), its label fades to ~50% opacity in the sidebar. Still clickable for re-listen. Resets on page refresh.

---

## What this replaces

If the current code has:
- The 14-topic flat list → replace with this 5-chapter structure
- Three-layer hierarchy with "Background", "AI work" as expandable sub-groups → remove all of that
- "Quick Hello", "Why Open", "How I work", "Background", "Logistics", "AI work", "Voice apps", "Open Mic" as top-level items → these were the old shape, replaced by the 5 chapters above
- Any references to chapter ids like `quick-hello`, `methodology`, `education`, `ai-earlier`, `ai-current`, `arcelormittal`, `voice-blockchain`, `looking-back`, `open-mic` → these are all gone. The Pawn Shop project now uses the id `pawn-shop` as a sub-item under `what-ive-built`.

---

## Visual notes

- Numbers next to chapter labels are optional. With only five items, numbers add visual noise. If easier to keep them (because the existing code uses them), they're fine. If it's a refactor to remove them, leave them.
- Sub-items are indented from their parent and typeset slightly smaller (12px vs 14px) to signal hierarchy
- The active main chapter uses the sage accent (`#88927D`) on the label text and a 2px sage bar flush to the left edge of the row
- Sub-items have a lighter active state — same sage tint, no left bar
- Default chapter label color is charcoal `#0A0A0A`
- Muted/inactive sub-items are medium gray `#666666`

---

## Content source

Each chapter's spoken content lives in `elevenlabs-knowledge-base.md`. The id strings above (`intro`, `why-open`, etc.) match the `**id:**` field on each chapter in that file. Frontend read-mode beats and sidebar labels are defined in `src/lib/topics.ts`.

The four voice app sub-items do NOT have separate spoken content. They are visual navigation aids inside the single `what-ive-built` chapter, which contains all four in chronological order as one continuous spoken arc. Clicking a sub-item scrolls or jumps within the chapter; the agent does not re-speak from a sub-item start point.

---

## Summary of behavior in one sentence

Five flat chapters by default. The active chapter shows its sub-items underneath if it has any. Everything else stays collapsed. There is no manual expand control — expansion follows active state.
