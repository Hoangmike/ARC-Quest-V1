'use client'
import Link from 'next/link'
import { useWeb3 } from '@/lib/web3'
import { Zap, CheckSquare, ListTodo, ArrowLeftRight, Layers, Award, ChevronRight, Users, TrendingUp, Shield, Cpu } from 'lucide-react'

const FEATURES = [
  {
    href: '/checkin', icon: CheckSquare, color: 'from-blue-600 to-cyan-500',
    glow: 'hover:shadow-blue hover:border-q-blue/40',
    title: 'Daily Check-In', desc: 'Check in every day. Build streaks for multiplied rewards.',
    badge: 'Up to 60 pts/day', accent: 'text-q-blue',
  },
  {
    href: '/tasks', icon: ListTodo, color: 'from-indigo-600 to-blue-500',
    glow: 'hover:shadow-[0_0_30px_rgba(99,102,241,0.25)] hover:border-indigo-500/40',
    title: 'Community Tasks', desc: 'Social, on-chain, and community tasks for one-time rewards.',
    badge: '15–75 pts/task', accent: 'text-indigo-400',
  },
  {
    href: '/swap', icon: ArrowLeftRight, color: 'from-sky-600 to-blue-400',
    glow: 'hover:shadow-cyan hover:border-q-cyan/40',
    title: 'Swap', desc: 'Swap USDC on Arc Testnet and earn points for every swap.',
    badge: '100 pts/USDC', accent: 'text-q-cyan',
  },
  {
    href: '/stake', icon: Layers, color: 'from-violet-600 to-purple-500',
    glow: 'hover:shadow-[0_0_30px_rgba(124,58,237,0.25)] hover:border-violet-500/40',
    title: 'Stake', desc: 'Lock your points and earn 1% daily compound yield.',
    badge: '365% APR', accent: 'text-q-purple',
  },
  {
    href: '/badges', icon: Award, color: 'from-amber-500 to-yellow-400',
    glow: 'hover:shadow-gold hover:border-q-gold/40',
    title: 'NFT Badges', desc: 'Redeem points for exclusive NFT badges of 4 rarities.',
    badge: 'Common → Legendary', accent: 'text-q-gold',
  },
]

const STATS = [
  { icon: Users,     val: '2,847',  sub: 'Active Users',        color: 'text-q-blue' },
  { icon: Zap,       val: '1.2M',   sub: 'Points Distributed',  color: 'text-q-cyan' },
  { icon: Award,     val: '4,193',  sub: 'Badges Minted',        color: 'text-q-gold' },
  { icon: TrendingUp,val: '28,400', sub: 'Tasks Completed',      color: 'text-q-purple' },
]

export default function HomePage() {
  const { isConnected, address, balance, connect, isConnecting } = useWeb3()

  return (
    <div className="max-w-7xl mx-auto px-4">

      {/* ─── Hero ─── */}
      <div className="pt-20 pb-16 text-center relative">
        {/* Decorative ring */}
        <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[500px] h-[500px]
                        border border-q-blue/10 rounded-full pointer-events-none" />
        <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[360px] h-[360px]
                        border border-q-blue/8 rounded-full pointer-events-none" />

        {/* Live badge */}
        <div className="inline-flex items-center gap-2 bg-q-blue/10 border border-q-blue/25
                        text-q-blue text-xs font-mono px-4 py-2 rounded-full mb-8">
          <span className="w-1.5 h-1.5 bg-q-blue rounded-full animate-pulse-slow" />
          Arc Testnet — Live
          <span className="text-q-muted ml-1">Chain ID: 5042002</span>
        </div>

        <h1 className="font-orb text-5xl sm:text-7xl lg:text-8xl tracking-widest
                       text-q-text mb-4 leading-none">
          ARC
          <br />
          <span className="glow-text" style={{ color: '#3b82f6' }}>QUEST</span>
        </h1>

        <p className="text-q-muted text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          Complete quests, earn points, collect badges.
          <br />
          Your journey on <span className="text-q-blue">Arc Network</span> starts here.
        </p>

        {!isConnected ? (
          <button onClick={connect} disabled={isConnecting} className="btn-primary px-8 py-3.5 text-base">
            {isConnecting
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Connecting…</>
              : <><Zap size={18} /> Launch Quest</>}
          </button>
        ) : (
          <div className="inline-flex items-center gap-6 bg-q-card border border-q-blue/25
                          rounded-2xl px-8 py-5 shadow-blue animate-[appear_0.3s_ease-out]">
            <div className="text-left">
              <p className="text-q-muted text-xs mb-1">Your Points</p>
              <p className="font-mono text-3xl font-semibold text-q-blue glow-text">
                {parseFloat(balance).toLocaleString('en-US', { maximumFractionDigits: 1 })}
                <span className="text-q-muted text-sm ml-1">AQP</span>
              </p>
            </div>
            <div className="w-px h-10 bg-q-border" />
            <div className="text-left">
              <p className="text-q-muted text-xs mb-1">Wallet</p>
              <p className="font-mono text-sm text-q-text">
                {address?.slice(0,8)}…{address?.slice(-6)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ─── Live Stats ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-16">
        {STATS.map(({ icon: Icon, val, sub, color }) => (
          <div key={sub} className="stat text-center">
            <Icon size={18} className={`${color} mx-auto mb-2`} />
            <p className={`font-mono text-2xl font-semibold ${color}`}>{val}</p>
            <p className="text-q-muted text-xs mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* ─── Features Grid ─── */}
      <div className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px flex-1 bg-q-border" />
          <h2 className="font-orb text-xs tracking-[0.3em] text-q-muted">EARN POINTS</h2>
          <div className="h-px flex-1 bg-q-border" />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ href, icon: Icon, color, glow, title, desc, badge, accent }) => (
            <Link key={href} href={href}
              className={`card shine group cursor-pointer transition-all duration-300 ${glow}`}>
              <div className="flex items-start justify-between mb-5">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color}
                                flex items-center justify-center shadow-lg`}>
                  <Icon size={18} className="text-white" />
                </div>
                <span className={`text-xs font-mono px-2.5 py-1 rounded-lg border
                                 bg-q-surface border-q-border ${accent}`}>
                  {badge}
                </span>
              </div>
              <h3 className="text-q-text font-semibold text-base mb-1.5
                             group-hover:text-q-blue transition-colors">{title}</h3>
              <p className="text-q-muted text-sm leading-relaxed mb-4">{desc}</p>
              <div className={`flex items-center gap-1 text-xs font-medium ${accent}`}>
                Start earning
                <ChevronRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ─── How it works ─── */}
      <div className="mb-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-px flex-1 bg-q-border" />
          <h2 className="font-orb text-xs tracking-[0.3em] text-q-muted">HOW IT WORKS</h2>
          <div className="h-px flex-1 bg-q-border" />
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { n: '01', icon: Cpu, col: 'text-q-blue', title: 'Connect', desc: 'Connect MetaMask and switch to Arc Testnet (Chain ID: 5042002). Get USDC from the Circle faucet.' },
            { n: '02', icon: Zap, col: 'text-q-cyan', title: 'Earn',    desc: 'Check in daily, complete community tasks, swap USDC, and stake tokens to accumulate AQP points.' },
            { n: '03', icon: Shield, col: 'text-q-gold', title: 'Collect', desc: 'Spend AQP points to mint exclusive NFT badges. Collect all rarities from Common to Legendary.' },
          ].map(({ n, icon: Icon, col, title, desc }) => (
            <div key={n} className="card text-center group">
              <div className={`font-orb text-5xl font-bold ${col}/20 mb-4 group-hover:${col}/40 transition-colors`}>{n}</div>
              <Icon size={24} className={`${col} mx-auto mb-3`} />
              <h3 className="text-q-text font-semibold mb-2">{title}</h3>
              <p className="text-q-muted text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Network info ─── */}
      <div className="card-glow mb-16 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-orb text-xs tracking-widest text-q-blue mb-1">NETWORK INFO</p>
          <h3 className="text-q-text font-semibold text-lg">Arc Testnet</h3>
          <p className="text-q-muted text-sm">Native gas token: USDC — No ETH needed</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a href="https://faucet.circle.com" target="_blank" rel="noopener noreferrer"
             className="btn-outline text-xs">Get USDC Faucet</a>
          <a href="https://testnet.arcscan.app" target="_blank" rel="noopener noreferrer"
             className="btn-ghost text-xs">Block Explorer ↗</a>
        </div>
      </div>
    </div>
  )
}
