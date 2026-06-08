import type { Metadata } from 'next'
import './globals.css'
import { Web3Provider } from '@/lib/web3'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'ARC Quest | Earn & Collect on Arc Network',
  description: 'Daily check-ins, community tasks, swap & stake to earn AQP points. Redeem for exclusive NFT badges on Arc Testnet.',
  keywords: ['ARC', 'Web3', 'DApp', 'NFT', 'Testnet', 'Points'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Web3Provider>
          {/* Ambient background effects */}
          <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            <div className="absolute inset-0 bg-grid opacity-60" />
            <div className="absolute inset-0 bg-grd-blue" />
            {/* Glow orbs */}
            <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[900px] h-[600px]
                            bg-q-glow/15 blur-[120px] rounded-full" />
            <div className="absolute bottom-0 right-[-100px] w-[500px] h-[500px]
                            bg-q-indigo/8 blur-[100px] rounded-full" />
            <div className="absolute bottom-1/3 left-[-50px] w-[300px] h-[300px]
                            bg-q-cyan/5 blur-[80px] rounded-full" />
            {/* Scan line */}
            <div className="scan-line" style={{ animationDuration: '6s' }} />
          </div>

          <div className="relative z-10 min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 pt-16">
              {children}
            </main>
            <footer className="border-t border-q-border mt-20 py-6">
              <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="font-orb text-xs text-q-muted tracking-widest">ARC QUEST © 2025</span>
                <div className="flex items-center gap-4 text-xs text-q-muted">
                  <a href="https://arc.network" target="_blank" rel="noopener noreferrer"
                     className="hover:text-q-blue transition-colors">Arc Network</a>
                  <a href="https://testnet.arcscan.app" target="_blank" rel="noopener noreferrer"
                     className="hover:text-q-blue transition-colors">Explorer</a>
                  <a href="https://faucet.circle.com" target="_blank" rel="noopener noreferrer"
                     className="hover:text-q-blue transition-colors">Faucet</a>
                </div>
              </div>
            </footer>
          </div>
        </Web3Provider>
      </body>
    </html>
  )
}
