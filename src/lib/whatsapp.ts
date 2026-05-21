/** Build wa.me URL from env — full link or phone + optional prefill text. */
export function getWhatsAppUrl(): string | null {
  const configured = process.env.NEXT_PUBLIC_WHATSAPP_URL?.trim();
  if (configured) return configured;

  const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE?.replace(/\D/g, '');
  if (!phone) return null;

  const text = process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE?.trim();
  const base = `https://wa.me/${phone}`;
  if (!text) return base;

  return `${base}?text=${encodeURIComponent(text)}`;
}
