# ElevenLabs client tools — setup checklist

If the transcript shows raw XML like `<function_calls><invoke name="highlightChapter">…`, the **model is typing tool calls as text**. Real client tools run in the browser and **do not appear in the transcript**.

## In the ElevenLabs UI (Agent → Ward → Tools)

For each tool:

| Setting | Value |
| --- | --- |
| **Tool type** | **Client** (not Server, not Webhook) |
| **Wait for response** | **Off** for all three tools |
| **Names (exact, case-sensitive)** | `highlightChapter`, `showCVDownload`, `switchToReadMode` |

### highlightChapter

- Parameter: `chapterId` (string, required)
- Allowed values: `intro`, `agent-experience`, `why-open`, `tabulas-deep`, `customer-facing`, `prompt-engineering`, `design-history`, `logistics`, `ask-anything`

### showCVDownload / switchToReadMode

- No parameters

## After creating tools

Creating tools under **Agents → Tools** only adds them to the **workspace library**. You must also attach them to the **Ward** agent.

1. Open **Agents → Ward → Tools** (or Security / Tools tab on the agent).
2. Add `highlightChapter`, `showCVDownload`, and `switchToReadMode` to this agent (not only visible on the global Tools page).
3. **Save** the agent.

If `tool_ids` is empty on the agent, the model will print XML like `<function_calls>` instead of invoking client tools.
3. In a test call, open the agent **Conversation history** in ElevenLabs: you should see **client_tool_call** events, not XML in the agent message.

## In the browser

1. Open DevTools → Console.
2. Start a call and trigger a chapter change.
3. If tools work, the sidebar highlights and you may see debug logs; you should **not** see `Unhandled client tool` warnings.

## System prompt

Re-paste from [elevenlabs-system-prompt.md](./elevenlabs-system-prompt.md) (includes “never write XML” rule).

## Common mistakes

- Tool type set to **Server** instead of **Client**
- Tool name typo (`highlight_chapter` vs `highlightChapter`)
- Tools created but **not attached** to the Ward agent
- **Wait for response** enabled when it should be off
