# ElevenLabs — dynamic variables & first-message override

**You do not paste runtime values into ElevenLabs.** The ask-ward website sends them automatically when someone clicks a dashboard card or sidebar chapter.

Your job in the dashboard is:

1. Tell the agent what those variables **mean** (system prompt).
2. Optionally add **placeholder names** for testing in the ElevenLabs playground.
3. Enable **First message override** in Security (required for chapter connect).

---

## What the app sends at runtime

When the listener picks a chapter before or during connect, `ConversationShell` calls:

```ts
conversation.startSession({
  conversationToken,
  connectionType: 'webrtc',
  dynamicVariables: {
    initial_chapter: 'why-open',           // example
    chapter_first_connect: true,
    suppress_dashboard_opening: true,
    initial_deeper_cut: 'momuse-deeper',   // only for voice-app tiles
  },
  overrides: {
    agent: { firstMessage: '…' },           // chapter first beat — not the dashboard script
  },
});
```

| Variable | Type | When set |
|----------|------|----------|
| `initial_chapter` | string | Card or sidebar chapter: `intro`, `why-open`, `about-ward`, `what-ive-built`, `practical` |
| `chapter_first_connect` | boolean | `true` on that path |
| `suppress_dashboard_opening` | boolean | `true` — do not say “pick any chapter on the left” |
| `initial_deeper_cut` | string | Voice-app tile only: `momuse-deeper`, `talk-to-product-deeper`, `pawn-shop-deeper`, `this-agent-deeper` |

Plain **Talk to me** / Start agent with no chapter → none of these are sent; the dashboard **First message** plays as configured.

---

## Where to configure in ElevenLabs

### 1. System prompt (main place)

**Agents → your Ward agent → System prompt**

Re-paste from [elevenlabs-system-prompt-v2.md](./elevenlabs-system-prompt-v2.md). It already documents `initial_chapter`, `suppress_dashboard_opening`, and `initial_deeper_cut` in prose.

Optional: add explicit template lines so the UI shows the variables (ElevenLabs recognizes `{{name}}`):

```text
If {{suppress_dashboard_opening}} is true, do not speak the dashboard First message ("pick any chapter on the left"). Use {{initial_chapter}} and the knowledge base only.

If {{initial_deeper_cut}} is set, call navigate_to_topic with what-ive-built and deliver that deeper cut first.

If {{initial_chapter}} is set on connect, speak that chapter immediately after navigate_to_topic.
```

You are **not** storing real values here—only instructions. Values are injected by the website when the session starts.

### 2. Dynamic variable placeholders (testing only)

In the agent editor, look for **Dynamic variables**, **Personalization**, or **Advanced** (UI label varies).

Add **placeholder** entries so the playground can simulate a card click:

| Name | Placeholder value (for tests) |
|------|-------------------------------|
| `initial_chapter` | `why-open` |
| `chapter_first_connect` | `true` |
| `suppress_dashboard_opening` | `true` |
| `initial_deeper_cut` | `momuse-deeper` |

Leave placeholders empty in production; the live site overrides them every session.

**Not in Knowledge Base** — KB is chapter copy only.  
**Not in Tools** — unless you deliberately reference `{{initial_chapter}}` in a tool description (not required for ask-ward).

### 3. First message override (Security — required)

**Agents → Ward → Security (or Platform settings → Overrides)**

Enable:

- **First message** override

Without this, the app cannot replace “Hi, I’m Ward. Pick any chapter…” when connecting from a card.

The **First message** field under the agent can stay as the fallback for plain Talk to me:

```text
Hi, I'm Ward. Pick any chapter on the left, or just ask me what you want to know.
```

### 4. First message field

**Agents → Ward → Agent → First message**

Paste the fallback line above. Chapter connects override it in code; this field is only for sessions with no `initial_chapter`.

---

## What you do *not* need to do

- Paste `why-open` or `momuse-deeper` into a variables text box for production — the frontend sends them.
- Add variables to the Knowledge Base document.
- Create a Server tool for navigation — use **Client** tools (`navigate_to_topic`, etc.) per [elevenlabs-client-tools-setup.md](./elevenlabs-client-tools-setup.md).

---

## Quick checklist

- [ ] System prompt updated from `elevenlabs-system-prompt-v2.md` (mentions `initial_chapter` / `suppress_dashboard_opening` / `initial_deeper_cut`)
- [ ] Optional `{{…}}` lines in system prompt for clarity
- [ ] Placeholder names added for playground testing (optional)
- [ ] **Security → First message override** enabled
- [ ] Client tools attached (`navigate_to_topic`, etc.)
- [ ] Test on the **live site** (not only playground) — only the site sends real `dynamicVariables`
