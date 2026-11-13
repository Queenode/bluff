import type { Metadata } from 'next';
import { Suspense } from 'react';
import './globals.css';
import { WalletProvider } from '@/lib/wallet';
import { Navbar } from '@/components/Navbar';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://bluff-sandy-two.vercel.app'),
  title: 'BLUFF • Trick the AI, take the NEAR',
  description:
    'Onchain AI red-teaming game on NEAR. Hosts lock NEAR behind an AI guardian; players pay per prompt to make it leak its secret code. Prompts, replies and payouts are verified by the contract.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className="dark h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Chakra+Petch:ital,wght@0,400;0,500;0,600;0,700;1,600;1,700&family=Orbitron:wght@500;600;700;800;900&family=Share+Tech+Mono&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#03060a] text-zinc-100 font-sans selection:bg-emerald-500 selection:text-black">
        <WalletProvider>
          <Suspense fallback={null}>
            <Navbar />
          </Suspense>
          <main className="flex-1">{children}</main>
        </WalletProvider>
      </body>
    </html>
  );
}
