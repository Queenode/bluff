import type { Metadata } from 'next';
import './globals.css';
import { NearProvider } from '@/lib/nearContext';
import { Navbar } from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'BLUFF • PvP AI Boss Arena & Vault Game on NEAR',
  description:
    'Outsmart autonomous AI Bosses guarding real NEAR vaults. Play Squad Deathmatch with friends, raid Global Jackpot Bosses, or hunt Protocol Bug Bounties.',
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
        <NearProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
        </NearProvider>
      </body>
    </html>
  );
}
