/** Max prefilled text length — wa.me URLs break if the query string is too long. */
const MAX_WHATSAPP_TEXT = 1800;

export type WhatsAppHistoryMessage = {
  role: 'user' | 'agent';
  text: string;
};

function truncateWhatsAppText(text: string): string {
  if (text.length <= MAX_WHATSAPP_TEXT) return text;
  return `${text.slice(0, MAX_WHATSAPP_TEXT - 16).trimEnd()}\n\n… [truncated]`;
}

/** Resolve WhatsApp number from env (phone var or wa.me URL). */
export function getWhatsAppPhone(): string | null {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE?.replace(/\D/g, '');
  if (phone) return phone;

  const configured = process.env.NEXT_PUBLIC_WHATSAPP_URL?.trim();
  if (!configured) return null;

  try {
    const url = new URL(configured);
    if (url.hostname === 'wa.me' || url.hostname === 'api.whatsapp.com') {
      const fromPath = url.pathname.replace(/\D/g, '');
      if (fromPath) return fromPath;
    }
  } catch {
    /* fall through */
  }

  return null;
}

/** Format live transcript lines for a WhatsApp prefill string. */
export function formatWhatsAppHistory(
  messages: WhatsAppHistoryMessage[]
): string {
  return messages
    .filter((message) => message.text.trim())
    .map((message) => {
      const label = message.role === 'user' ? 'Me' : 'Ward';
      return `[${label}]: ${message.text.trim()}`;
    })
    .join('\n');
}

/** Build the full prefilled message — intro from env plus optional conversation history. */
export function buildWhatsAppMessage(historyText?: string): string {
  const prefix =
    process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE?.trim() ??
    'Hi Ward — I had a question from Ask Ward';

  const history = historyText?.trim();
  if (!history) return prefix;

  return truncateWhatsAppText(
    `${prefix}\n\n---\nFrom Ask Ward:\n${history}`
  );
}

/** Build wa.me URL — phone from env; message includes conversation history when provided. */
export function getWhatsAppUrl(
  messages: WhatsAppHistoryMessage[] = []
): string | null {
  const phone = getWhatsAppPhone();
  if (!phone) return null;

  const historyText =
    messages.length > 0 ? formatWhatsAppHistory(messages) : undefined;
  const text = buildWhatsAppMessage(historyText);

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
