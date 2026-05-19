# Conversation token API (WebRTC)

The v1 handoff described `GET /api/signed-url` returning a signed URL for `startSession({ signedUrl, connectionType: 'webrtc' })`.

In `@elevenlabs/react` / `@elevenlabs/client` (v1.6+):

- **`signedUrl`** → WebSocket only
- **`conversationToken`** → WebRTC

This repo implements:

```
GET /api/conversation-token
→ ElevenLabs GET /v1/convai/conversation/token?agent_id=...
→ { "conversationToken": "..." }
```

Client:

```ts
await conversation.startSession({
  conversationToken,
  connectionType: 'webrtc',
});
```

The API key stays on the server; the browser still connects directly to ElevenLabs for audio.
