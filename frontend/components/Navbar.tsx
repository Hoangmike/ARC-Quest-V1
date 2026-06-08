'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useWeb3 } from '@/lib/web3'
import { Zap, CheckSquare, ListTodo, ArrowLeftRight, Layers, Award, Menu, X, AlertTriangle, User } from 'lucide-react'
import clsx from 'clsx'

const LINKS = [
  { href: '/checkin', label: 'Check-In', icon: CheckSquare },
  { href: '/tasks',   label: 'Tasks',    icon: ListTodo },
  { href: '/swap',    label: 'Swap',     icon: ArrowLeftRight },
  { href: '/stake',   label: 'Stake',    icon: Layers },
  { href: '/badges',  label: 'Badges',   icon: Award },
  { href: '/profile', label: 'Profile',  icon: User },
]

export default function Navbar() {
  const path = usePathname()
  const { address, balance, isConnected, isCorrectNetwork, isConnecting, connect, disconnect, switchNet } = useWeb3()
  const [open, setOpen] = useState(false)

  const addr  = address ? `${address.slice(0,6)}…${address.slice(-4)}` : ''
  const pts   = parseFloat(balance).toLocaleString('en-US', { maximumFractionDigits: 1 })

  return (
    <nav className="fixed top-0 inset-x-0 z-50 h-16
                    bg-q-bg/70 backdrop-blur-xl border-b border-q-border">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="relative w-8 h-8">
            <div className="w-8 h-8 hex-icon bg-grd-btn flex items-center justify-center
                            group-hover:shadow-blue transition-shadow duration-300">
              <Zap size={15} className="text-white fill-white" />
            </div>
            <div className="absolute inset-0 hex-icon bg-grd-btn opacity-0
                            group-hover:opacity-30 blur-sm transition-opacity duration-300" />
          </div>
          <span className="font-orb text-base font-semibold tracking-widest text-q-text
                           hidden sm:block">
            ARC<span className="text-q-blue glow-text">QUEST</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {LINKS.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}
              className={path === href ? 'nav-item-active' : 'nav-item'}>
              <Icon size={14} />
              {label}
            </Link>
          ))}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 shrink-0">
          {isConnected && (
            <div className="hidden sm:flex items-center gap-1.5
                            bg-q-surface border border-q-border rounded-lg px-3 py-1.5">
              <Zap size={12} className="text-q-blue fill-q-blue" />
              <span className="font-mono text-q-blue text-sm font-semibold">{pts}</span>
              <span className="text-q-muted text-xs">pts</span>
            </div>
          )}

          {!isConnected ? (
            <button onClick={connect} disabled={isConnecting} className="btn-primary text-xs px-4 py-2">
              {isConnecting
                ? <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Connecting…</>
                : <><Zap size={13} /> Connect Wallet</>}
            </button>
          ) : !isCorrectNetwork ? (
            <button onClick={switchNet}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium
                         bg-amber-500/10 border border-amber-500/30 text-amber-400
                         hover:bg-amber-500/20 transition-colors">
              <AlertTriangle size={13} /> Wrong Network
            </button>
          ) : (
            <button onClick={disconnect}
              className="btn-outline text-xs px-4 py-2">
              {addr}
            </button>
          )}

          <button className="md:hidden btn-ghost p-1.5" onClick={() => setOpen(!open)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden absolute top-16 inset-x-0 bg-q-bg/95 backdrop-blur-xl
                        border-b border-q-border py-3 px-4 flex flex-col gap-1
                        animate-[appear_0.2s_ease-out]">
          {isConnected && (
            <div className="flex items-center justify-between px-3 py-2 mb-1
                            bg-q-surface border border-q-border rounded-lg">
              <div className="flex items-center gap-1.5">
                <Zap size={13} className="text-q-blue fill-q-blue" />
                <span className="font-mono text-q-blue text-sm font-semibold">{pts} pts</span>
              </div>
              <span className="text-q-muted text-xs font-mono">{addr}</span>
            </div>
          )}
          {LINKS.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              className={path === href ? 'nav-item-active' : 'nav-item'}>
              <Icon size={15} /> {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
