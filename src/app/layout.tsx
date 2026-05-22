import type { Metadata, Viewport } from 'next';
import { Instrument_Serif, Inter } from 'next/font/google';
import { Providers } from '@/components/providers';
import './globals.css';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['400', '500'],
});

const instrumentSerif = Instrument_Serif({
  variable: '--font-serif',
  subsets: ['latin'],
  weight: ['400'],
});

export const metadata: Metadata = {
  title: 'Ask Ward — AI Agent Designer application for Open',
  description:
    'A voice-based application for the AI Agent Designer role at Open. Ask Ward about his work in voice AI, knowledge graphs, and 25 years of product design.',
  metadataBase: new URL('https://ask.tabulas.eu'),
  openGraph: {
    title: 'Ask Ward',
    description:
      'A voice-based application for the AI Agent Designer role at Open. Ask Ward about his work in voice AI, knowledge graphs, and 25 years of product design.',
    url: 'https://ask.tabulas.eu',
    siteName: 'Ask Ward',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ask Ward',
    description:
      'A voice-based application for the AI Agent Designer role at Open. Ask Ward about his work in voice AI, knowledge graphs, and 25 years of product design.',
  },
  icons: {
    icon: '/hero-seal.png',
    apple: '/hero-seal.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${instrumentSerif.variable} h-full h-dvh`}
    >
      <body className="min-h-full min-h-dvh font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
