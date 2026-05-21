# ElevenLabs client tools — setup checklist (v2)

If the transcript shows raw XML like `<function_calls><invoke name="navigate_to_topic">…`, the **model is typing tool calls as text**. Real client tools run in the browser and **do not appear in the transcript**.

## Agent settings (v2)

| Setting | Value |
| --- | --- |
| Temperature | 0.2–0.4 |
| Stability | High |
| Guardrails | Enabled |
| System prompt | [elevenlabs-system-prompt-v2.md](./elevenlabs-system-prompt-v2.md) |
| Knowledge base | [elevenlabs-topics-knowledge-base.md](./elevenlabs-topics-knowledge-base.md) + CV PDF |

## In the ElevenLabs UI (Agent → Ward → Tools)

For each tool:

| Setting | Value |
| --- | --- |
| **Tool type** | **Client** (not Server, not Webhook) |
| **Wait for response** | **Off** for all tools |
| **Names (exact, case-sensitive)** | See table below |

Attach every tool to the **Ward** agent (not only the workspace Tools library).

### navigate_to_topic

- **Parameter name in ElevenLabs UI must be exactly `topicId`** (camelCase, required, string)
- Allowed values: `hello`, `why-open`, `about-ward`, `what-ive-built`, `practical`
- The app also accepts `topic_id`, `chapterId`, chapter labels, and legacy ids — but an **empty** `{}` payload means the tool schema in ElevenLabs is wrong (no parameter defined or wrong key)
- DevTools: `[ask-ward:nav] tool.navigate.unresolved` with `parameterKeys: []` → fix the tool definition in the ElevenLabs dashboard, re-save the agent, start a **new** conversation

### set_role

- Parameter: `role` (string, required): `founder`, `hiring_manager`, `recruiter`

### connect_to_ward

- No parameters

### open_side_panel

- No parameters

### showCVDownload / switchToReadMode

- No parameters

### Legacy (optional during migration)

- `highlightChapter` with `chapterId` — still registered in the app as an alias for `navigate_to_topic`

## Environment (Vercel / `.env.local`)

```
NEXT_PUBLIC_WHATSAPP_URL=https://wa.me/32471353104
```

WARD: replace with your WhatsApp link.

## After creating tools

1. Open **Agents → Ward → Tools** and attach all client tools.
2. **Save** the agent.
3. Test: sidebar highlight and side panel should update when the agent calls `navigate_to_topic`.
4. DevTools console should not show `Unhandled client tool` warnings.

## System prompt

Re-paste from [elevenlabs-system-prompt-v2.md](./elevenlabs-system-prompt-v2.md) (includes “never write XML” and `\n\n` beat rules).

## Common mistakes

- Tool type set to **Server** instead of **Client**
- Tool name typo (`navigate_to_topic` vs `navigateToTopic`)
- Tools created but **not attached** to the Ward agent
- **Wait for response** enabled when it should be off
- Agent omits `\n\n` between beats (breaks bubble sync)

## v2 launch checklist (WARD)

- [ ] Paste v2 system prompt and first message
- [ ] Upload v2 knowledge base + CV
- [ ] Create and attach all client tools
- [ ] Set temperature 0.2–0.4, enable guardrails
- [ ] Set `NEXT_PUBLIC_WHATSAPP_URL` on Vercel
- [ ] Replace `public/ward-portrait.png` with your head-and-shoulders crop (placeholder copies `hero-collage.png` until then)
- [ ] Test interruption mid-beat and click vs voice navigation parity
