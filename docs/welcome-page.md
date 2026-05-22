# Welcome Page — One-Pager Spec

**Status:** Pre-activation hero. Disappears once "Talk to me" is clicked.

---

## Content

**Hero headline** (large serif, ~64px desktop):
Designing agents that work out of the box.

**Subhead** (sans, muted, ~20px):
Twenty years between customers and products.

**Dashboard cards** (below hero, before CTA):

1. **Intro** — How this works
2. **Why Open** — Why I want to work here
3. **About Ward** — Belgian designer, 20 years
4. **What I've built** — Four voice apps
   - MoMuse (image)
   - Talk to the product (image)
   - Pawn Shop (image)
   - This agent (image)
5. **Practical** — Logistics, availability

**CTA:** "Talk to me" button (primary, sage `#88927D`)

---

## Layout — Desktop (>1024px)

- Headline + subhead: left column, 50% width
- Hero image: right column, bleeds off right edge
- Cards: horizontal row, 5 cards, below headline
- CTA: below cards, left-aligned

## Layout — Mobile (<768px)

- Left column (~58% width) stacks headline → chapter row → What I've built row → CTA
- Hero collage: same fixed full-height frame as active session (right edge, not an in-flow thumbnail)
- Chapter cards: one horizontal row (scroll if needed)
- What I've built sub-items: horizontal row of thumbnails
- CTA: full width of left column, sticky to bottom of viewport

---

## Card structure

Each card:
- Label (e.g. "Why Open")
- One-line description
- Click → activates agent AND navigates to that chapter

**What I've built card** has nested sub-items with thumbnails:
- Each voice app shows a small image (max 80px height)
- Click on sub-item → activates agent + navigates to What I've built + scrolls to that sub-section

---

## Behavior

- Cards are clickable AS THE CTA. Clicking any card starts the agent and routes to that chapter.
- The "Talk to me" button is just a default entry — equivalent to clicking the Intro card.
- Once activated, the welcome page disappears. Hero shrinks/repositions, orb takes over, chat begins.

## Card → chapter wiring

On card click the UI calls the same path as `navigate_to_topic(topic_id)`:

1. Activate the agent (start session).
2. Set `dynamic_variables.initial_chapter` to the chapter id.
3. After connect, send a `[nav]` contextual update (`buildChapterNavMessage`).

| Card label | `topic_id` |
|---|---|
| Intro | `intro` |
| Why Open | `why-open` |
| About Ward | `about-ward` |
| What I've built | `what-ive-built` |
| Practical | `practical` |

### What I've built sub-items

Sub-item click → `navigate_to_topic("what-ive-built")` plus deeper-cut hint:

| Sub-item | `initial_deeper_cut` / `[nav] deeper_cut` |
|---|---|
| MoMuse | `momuse-deeper` |
| Talk to the product | `talk-to-product-deeper` |
| Pawn Shop | `pawn-shop-deeper` |
| This agent | `this-agent-deeper` |

Implementation: `src/lib/navigate-to-topic.ts`, `src/lib/deeper-cuts.ts`, `navigateToTopicFromUi` in `ConversationShell.tsx`. Optional agent tool: `show_deeper_cut`.

**Disable dashboard “Hi I’m Ward, pick a chapter…”** on card/sidebar connect: `startSession` passes `overrides.agent.firstMessage` (chapter first beat or deeper-cut opener) plus `suppress_dashboard_opening`. Enable **First message override** in the ElevenLabs agent Security tab.

---

## Images needed

- Hero collage (microphone illustration) — `public/hero-collage.png`
- 4 voice app thumbnails under `public/`:
  - `momuse.png`
  - `talktoproduct.png`
  - `pawnshop.png`
  - `hero-collage.png` (This agent — replace with site screenshot when available)

---

## Visual rules

- Off-white background `#F8F8F7`
- Headline charcoal `#0A0A0A`, serif (editorial)
- Subhead muted gray `#666666`, sans
- Cards: white background, hairline border, 8px radius
- Hover state: sage `#88927D` tint
- Sage accent only on CTA and active hover states
- No gradients, no decoration
