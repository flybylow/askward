import { getWhatsAppUrl } from '@/lib/whatsapp';

export type SiteContactInfo = {
  email: string;
  phoneDisplay: string;
  phoneTel: string;
  whatsAppUrl: string | null;
};

const DEFAULT_EMAIL = 'warddem@gmail.com';
const DEFAULT_PHONE = '32471353104';

function formatPhoneDisplay(digits: string): string {
  if (digits.startsWith('32') && digits.length === 11) {
    return `+32 ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)} ${digits.slice(9, 11)}`;
  }
  return digits.startsWith('+') ? digits : `+${digits}`;
}

export function getSiteContactInfo(): SiteContactInfo {
  const email =
    process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || DEFAULT_EMAIL;
  const rawPhone =
    process.env.NEXT_PUBLIC_CONTACT_PHONE?.replace(/\D/g, '') ||
    DEFAULT_PHONE;

  return {
    email,
    phoneDisplay: formatPhoneDisplay(rawPhone),
    phoneTel: `+${rawPhone.replace(/^\+/, '')}`,
    whatsAppUrl: getWhatsAppUrl(),
  };
}
