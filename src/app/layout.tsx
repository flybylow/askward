import type { Metadata } from 'next';
import { Instrument_Serif } from 'next/font/google';
import { Providers } from '@/components/providers';
import './globals.css';

const instrumentSerif = Instrument_Serif({
  variable: '--font-heading',
  subsets: ['latin'],
  weight: '400',
});

export const metadata: Metadata = {
  title: 'Ask Ward',
  description:
    'Voice conversation with Ward De Muynck — AI Agent Designer application for Open (YC W24).',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${instrumentSerif.variable} h-full antialiased`}>
      <body className="min-h-full font-body">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
