import type { Metadata } from 'next';
import './globals.css';
import { NearProvider } from '@/lib/nearContext';
import { Navbar } from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'AGENT[HEIST] • Decentralized AI Red-Teaming & Vault Arena on NEAR',
  description:
    'Challenge autonomous AI sentinels, host high-stakes squad stand-offs with friends, and stress-test enterprise DeFi agents with real NEAR tokens locked in onchain escrow.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col bg-black text-zinc-100 font-sans selection:bg-emerald-500 selection:text-black">
        <NearProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
        </NearProvider>
      </body>
    </html>
  );
}
