import { NextResponse } from 'next/server';

/**
 * Mints a WebRTC conversation token for private ElevenLabs agents.
 * The browser connects directly to ElevenLabs; this route only holds the API key.
 */
export async function GET() {
  const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID?.trim();
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();

  if (!agentId || !apiKey) {
    return NextResponse.json(
      {
        error:
          'Missing ELEVENLABS_API_KEY or NEXT_PUBLIC_ELEVENLABS_AGENT_ID',
      },
      { status: 500 }
    );
  }

  try {
    const resp = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=${agentId}`,
      { headers: { 'xi-api-key': apiKey } }
    );

    if (!resp.ok) {
      const text = await resp.text();
      let message = text;
      try {
        const parsed = JSON.parse(text) as {
          detail?: { message?: string };
        };
        message = parsed.detail?.message ?? text;
      } catch {
        /* use raw text */
      }
      return NextResponse.json({ error: message }, { status: resp.status });
    }

    const data = (await resp.json()) as { token: string };
    return NextResponse.json({ conversationToken: data.token });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
