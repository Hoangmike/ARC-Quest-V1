'use client'
import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import { useWeb3 } from '@/lib/web3'
import {
  ADDR, POINT_TOKEN_ABI, CHECKIN_ABI,
  TASK_MANAGER_ABI, MOCK_SWAP_ABI, STAKE_POOL_ABI, BADGE_NFT_ABI
} from '@/lib/contracts'
import { User, Zap, CheckSquare, ListTodo, ArrowLeftRight, Layers, Award, Copy, ExternalLink, AlertTriangle } from 'lucide-react'
import clsx from 'clsx'

const RARITY_LABEL = ['Common', 'Rare', 'Epic', 'Legendary']
const RARITY_CLS   = ['rarity-common', 'rarity-rare', 'rarity-epic', 'rarity-legendary']
const BADGE_EMOJIS = ['🌱','📅','🎯','🔄','🏦','⚔️','💎','⭐']

interface Stats {
  balance:    string
  streak:     number
  totalCI:    number
  totalTasks: number
  swapVol:    string
  staked:     string
  badgeCount: number
  badgeIds:   number[]
}

export default function ProfilePage() {
  const { address, isConnected, isCorrectNetwork, signer, connect, switchNet } = useWeb3()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied]   = useState(false)

  const load = useCallback(async () => {
    if (!signer || !address) return
    setLoading(true)
    try {
      const [pt, ci, tm, ms, sp, bn] = [
        new ethers.Contract(ADDR.POINT_TOKEN,  POINT_TOKEN_ABI,  signer),
        new ethers.Contract(ADDR.CHECKIN,      CHECKIN_ABI,      signer),
        new ethers.Contract(ADDR.TASK_MANAGER, TASK_MANAGER_ABI, signer),
        new ethers.Contract(ADDR.MOCK_SWAP,    MOCK_SWAP_ABI,    signer),
        new ethers.Contract(ADDR.STAKE_POOL,   STAKE_POOL_ABI,   signer),
        new ethers.Contract(ADDR.BADGE_NFT,    BADGE_NFT_ABI,    signer),
      ]
      const [bal, ciData, totalTasks, swapStats, stakeInfo, badgeBal] = await Promise.all([
        pt.balanceOf(address),
        ci.getUserData(address),
        tm.totalTasksCompleted(address),
        ms.getUserStats(address),
        sp.getStakeInfo(address),
        bn.balanceOf(address),
      ])
      setStats({
        balance:    ethers.formatEther(bal),
        streak:     Number(ciData[1]),
        totalCI:    Number(ciData[2]),
        totalTasks: Number(totalTasks),
        swapVol:    ethers.formatEther(swapStats[0]),
        staked:     ethers.formatEther(stakeInfo[0]),
        badgeCount: Number(badgeBal),
        badgeIds:   [],
      })
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [signer, address])

  useEffect(() => { load() }, [load])

  const copyAddr = () => {
    if (!address) return
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shortAddr = address ? `${address.slice(0, 10)}…${address.slice(-8)}` : ''

  // XP level based on total points earned
  const totalEarned = stats ? parseFloat(stats.balance) + (stats.badgeCount * 100) : 0
  const level = Math.floor(totalEarned / 100) + 1
  const xpInLevel = totalEarned % 100
  const xpPct = xpInLevel

  if (!isConnected) return (
    <div className="max-w-lg mx-auto px-4 pt-24 text-center">
      <User size={52} className="text-q-blue mx-auto mb-5 animate-float" />
      <h1 className="font-orb text-4xl tracking-widest text-q-text mb-3">PROFILE</h1>
      <p className="text-q-muted mb-8">Connect your wallet to view your profile.</p>
      <button onClick={connect} className="btn-primary px-8 py-3">Connect Wallet</button>
    </div>
  )

  if (!isCorrectNetwork) return (
    <div className="max-w-lg mx-auto px-4 pt-24 text-center">
      <AlertTriangle size={52} className="text-amber-400 mx-auto mb-5" />
      <h1 className="font-orb text-3xl tracking-widest text-q-text mb-3">WRONG NETWORK</h1>
      <button onClick={switchNet} className="btn-primary px-8 py-3">Switch to Arc Testnet</button>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8 animate-[appear_0.3s_ease-out]">
        <span className="text-xs font-mono text-q-blue bg-q-blue/10 border border-q-blue/20 px-3 py-1 rounded-full">
          PLAYER PROFILE
        </span>
        <h1 className="font-orb text-4xl sm:text-5xl tracking-widest text-q-text mt-2">PROFILE</h1>
      </div>

      {/* Identity card */}
      <div className="card-active mb-6 animate-[appear_0.3s_ease-out]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-grd-btn flex items-center justify-center
                            shadow-blue text-3xl font-orb text-white">
              {address?.slice(2, 3).toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-q-green
                            flex items-center justify-center border-2 border-q-bg">
              <span className="text-[10px] text-white font-bold">{level}</span>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-orb text-q-text text-lg tracking-wide">
                ADVENTURER #{address?.slice(-6).toUpperCase()}
              </span>
              <span className="text-xs bg-q-blue/10 border border-q-blue/20 text-q-blue px-2 py-0.5 rounded-full">
                Level {level}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-mono text-xs text-q-muted">{shortAddr}</span>
              <button onClick={copyAddr} className="text-q-muted hover:text-q-blue transition-colors">
                {copied ? <span className="text-q-green text-[10px]">✓ Copied</span> : <Copy size={13} />}
              </button>
              <a href={`https://testnet.arcscan.app/address/${address}`} target="_blank"
                 rel="noopener noreferrer" className="text-q-muted hover:text-q-blue transition-colors">
                <ExternalLink size={13} />
              </a>
            </div>
            {/* XP bar */}
            <div>
              <div className="flex justify-between text-[10px] text-q-muted mb-1">
                <span>Level {level} XP</span>
                <span>{xpInLevel.toFixed(0)} / 100</span>
              </div>
              <div className="progress-bar h-2">
                <div className="progress-fill h-full transition-all duration-1000"
                     style={{ width: `${xpPct}%` }} />
              </div>
            </div>
          </div>

          {/* Point balance */}
          <div className="text-right shrink-0">
            <p className="text-q-muted text-xs mb-1">Balance</p>
            <p className="font-mono text-3xl font-semibold text-q-blue glow-text">
              {stats ? parseFloat(stats.balance).toFixed(1) : '—'}
            </p>
            <p className="text-q-muted text-xs">AQP Points</p>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      {loading ? (
        <div className="text-center py-16 text-q-muted text-sm">Loading stats…</div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            {[
              { icon: CheckSquare, label: 'Check-In Streak',  val: `${stats.streak} days`,          color: 'text-orange-400' },
              { icon: CheckSquare, label: 'Total Check-Ins',  val: stats.totalCI,                    color: 'text-q-blue' },
              { icon: ListTodo,    label: 'Tasks Completed',  val: stats.totalTasks,                 color: 'text-indigo-400' },
              { icon: ArrowLeftRight, label: 'Vol. Swapped',  val: `${parseFloat(stats.swapVol).toFixed(3)} USDC`, color: 'text-q-cyan' },
              { icon: Layers,      label: 'AQP Staked',       val: `${parseFloat(stats.staked).toFixed(1)} AQP`, color: 'text-q-purple' },
              { icon: Award,       label: 'Badges Collected', val: stats.badgeCount,                 color: 'text-q-gold' },
            ].map(({ icon: Icon, label, val, color }) => (
              <div key={label} className="stat group hover:border-q-border/80 transition-colors">
                <Icon size={15} className={clsx(color, 'mb-1')} />
                <div className={clsx('stat-val', color)}>{val}</div>
                <div className="stat-label">{label}</div>
              </div>
            ))}
          </div>

          {/* Achievements */}
          <div className="card mb-6">
            <h3 className="text-q-text font-semibold mb-4 flex items-center gap-2 text-sm">
              <Award size={15} className="text-q-gold" /> Achievements Unlocked
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'First Steps',    unlocked: stats.totalCI >= 1,       emoji: '👋', desc: 'First check-in' },
                { label: 'Week Warrior',   unlocked: stats.streak >= 7,        emoji: '🔥', desc: '7-day streak' },
                { label: 'Task Master',    unlocked: stats.totalTasks >= 5,    emoji: '✅', desc: 'Complete 5 tasks' },
                { label: 'DEX Explorer',   unlocked: parseFloat(stats.swapVol) > 0, emoji: '🔄', desc: 'First swap' },
                { label: 'Yield Farmer',   unlocked: parseFloat(stats.staked) > 0, emoji: '🌾', desc: 'Start staking' },
                { label: 'Collector',      unlocked: stats.badgeCount >= 1,    emoji: '🏆', desc: 'First badge' },
                { label: 'OG Questor',     unlocked: stats.totalCI >= 30,      emoji: '⭐', desc: '30 check-ins' },
                { label: 'Point Whale',    unlocked: parseFloat(stats.balance) >= 500, emoji: '💎', desc: '500+ points' },
              ].map(({ label, unlocked, emoji, desc }) => (
                <div key={label} className={clsx(
                  'flex flex-col items-center text-center p-3 rounded-xl border transition-all',
                  unlocked
                    ? 'bg-q-blue/8 border-q-blue/25 shadow-[0_0_10px_rgba(59,130,246,0.15)]'
                    : 'bg-q-surface border-q-border opacity-40'
                )}>
                  <span className="text-2xl mb-1.5">{emoji}</span>
                  <p className={clsx('text-xs font-semibold', unlocked ? 'text-q-text' : 'text-q-muted')}>{label}</p>
                  <p className="text-[10px] text-q-muted mt-0.5">{desc}</p>
                  {unlocked && (
                    <span className="text-[9px] text-q-green mt-1 bg-green-500/10 px-1.5 py-0.5 rounded-full">
                      UNLOCKED
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div className="card">
            <h3 className="text-q-text font-semibold mb-4 text-sm flex items-center gap-2">
              <ExternalLink size={14} className="text-q-muted" /> Quick Links
            </h3>
            <div className="flex flex-wrap gap-3">
              <a href={`https://testnet.arcscan.app/address/${address}`} target="_blank"
                 rel="noopener noreferrer" className="btn-outline text-xs">
                View on Explorer ↗
              </a>
              <a href="https://faucet.circle.com" target="_blank" rel="noopener noreferrer"
                 className="btn-ghost text-xs">USDC Faucet ↗</a>
              <a href="https://docs.arc.network" target="_blank" rel="noopener noreferrer"
                 className="btn-ghost text-xs">Arc Docs ↗</a>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
