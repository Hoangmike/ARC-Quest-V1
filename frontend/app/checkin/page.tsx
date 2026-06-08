'use client'
import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import { useWeb3 } from '@/lib/web3'
import { ADDR, CHECKIN_ABI } from '@/lib/contracts'
import { CheckSquare, Flame, Calendar, Zap, Clock, Trophy, AlertTriangle } from 'lucide-react'
import clsx from 'clsx'

function Countdown({ seconds }: { seconds: number }) {
  const [s, setS] = useState(seconds)
  useEffect(() => {
    setS(seconds)
    const id = setInterval(() => setS(p => Math.max(0, p - 1)), 1000)
    return () => clearInterval(id)
  }, [seconds])
  const pad = (n: number) => String(n).padStart(2, '0')
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60
  return (
    <div className="flex items-center gap-1 font-mono text-3xl font-semibold text-q-blue glow-text">
      <span>{pad(h)}</span>
      <span className="text-q-muted animate-pulse">:</span>
      <span>{pad(m)}</span>
      <span className="text-q-muted animate-pulse">:</span>
      <span>{pad(sec)}</span>
    </div>
  )
}

export default function CheckInPage() {
  const { signer, address, isConnected, isCorrectNetwork, refresh, connect, switchNet } = useWeb3()
  const [data, setData] = useState({ lastCheckIn: 0, streak: 0, totalCheckIns: 0, can: false })
  const [countdown, setCountdown] = useState(0)
  const [loading, setLoading] = useState(false)
  const [txHash, setTxHash] = useState('')
  const [error,  setError]  = useState('')

  const load = useCallback(async () => {
    if (!signer || !address) return
    try {
      const c = new ethers.Contract(ADDR.CHECKIN, CHECKIN_ABI, signer)
      const [last, streak, total, can] = await c.getUserData(address)
      setData({ lastCheckIn: Number(last), streak: Number(streak), totalCheckIns: Number(total), can })
      if (!can) {
        const t = await c.getTimeUntilNextCheckIn(address)
        setCountdown(Number(t))
      }
    } catch (e) { console.error(e) }
  }, [signer, address])

  useEffect(() => { load() }, [load])

  const doCheckIn = async () => {
    if (!signer) return
    setLoading(true); setError(''); setTxHash('')
    try {
      const c = new ethers.Contract(ADDR.CHECKIN, CHECKIN_ABI, signer)
      const tx = await c.checkIn()
      setTxHash(tx.hash)
      await tx.wait()
      await load(); await refresh()
    } catch (e: any) { setError(e?.reason || e?.message?.split('\n')[0] || 'Transaction failed') }
    finally { setLoading(false) }
  }

  const bonus   = Math.min((data.streak - 1) * 5, 50)
  const todayPts = 10 + bonus

  // Calendar: last 35 days in 5 weeks
  const calDays = Array.from({ length: 35 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (34 - i))
    return d
  })

  if (!isConnected) return (
    <div className="max-w-lg mx-auto px-4 pt-24 text-center">
      <CheckSquare size={52} className="text-q-blue mx-auto mb-5 animate-float" />
      <h1 className="font-orb text-4xl tracking-widest text-q-text mb-3">DAILY CHECK-IN</h1>
      <p className="text-q-muted mb-8">Connect your wallet to start earning daily points.</p>
      <button onClick={connect} className="btn-primary px-8 py-3">Connect Wallet</button>
    </div>
  )

  if (!isCorrectNetwork) return (
    <div className="max-w-lg mx-auto px-4 pt-24 text-center">
      <AlertTriangle size={52} className="text-amber-400 mx-auto mb-5" />
      <h1 className="font-orb text-3xl tracking-widest text-q-text mb-3">WRONG NETWORK</h1>
      <p className="text-q-muted mb-8">Switch to Arc Testnet to continue.</p>
      <button onClick={switchNet} className="btn-primary px-8 py-3">Switch to Arc Testnet</button>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8 animate-[appear_0.3s_ease-out]">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono text-q-blue bg-q-blue/10 border border-q-blue/20 px-3 py-1 rounded-full">
            DAILY QUEST
          </span>
        </div>
        <h1 className="font-orb text-4xl sm:text-5xl tracking-widest text-q-text">
          CHECK<span className="text-q-blue glow-text">-IN</span>
        </h1>
        <p className="text-q-muted mt-1 text-sm">Check in daily, build streaks, earn bonus points.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="stat">
          <Flame size={16} className="text-orange-400 mb-1" />
          <div className="stat-val text-orange-400">{data.streak}</div>
          <div className="stat-label">Day Streak 🔥</div>
        </div>
        <div className="stat">
          <Trophy size={16} className="text-q-gold mb-1" />
          <div className="stat-val">{data.totalCheckIns}</div>
          <div className="stat-label">Total Check-Ins</div>
        </div>
        <div className="stat">
          <Zap size={16} className="text-q-blue mb-1" />
          <div className="stat-val text-q-blue">{todayPts}</div>
          <div className="stat-label">Today's Points</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Main action card */}
        <div className="card-active flex flex-col items-center py-10 text-center">
          {data.can !== false ? (
            <>
              {/* Pulsing ring */}
              <div className="relative mb-6">
                <div className="absolute inset-[-12px] rounded-full border border-q-blue/30 animate-ping" />
                <div className="absolute inset-[-6px] rounded-full border border-q-blue/20" />
                <div className="w-20 h-20 rounded-full bg-q-blue/10 border-2 border-q-blue/40
                                flex items-center justify-center animate-glow-pulse">
                  <CheckSquare size={36} className="text-q-blue" />
                </div>
              </div>
              <p className="text-q-text font-semibold text-lg mb-1">Ready to Check In!</p>
              <p className="text-q-muted text-sm mb-2">
                Earn <span className="text-q-blue font-semibold">{todayPts} AQP</span>
                {bonus > 0 && <span className="text-orange-400 ml-1">(+{bonus} streak bonus)</span>}
              </p>
              <button onClick={doCheckIn} disabled={loading} className="btn-primary mt-4 px-10 py-3 text-base">
                {loading
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Checking In…</>
                  : <><Zap size={18} /> Check In Now</>}
              </button>
            </>
          ) : (
            <>
              <div className="w-20 h-20 rounded-full bg-q-green/10 border-2 border-q-green/40
                              flex items-center justify-center mb-6">
                <CheckSquare size={36} className="text-q-green" />
              </div>
              <p className="text-q-text font-semibold text-lg mb-1">Checked In Today! ✓</p>
              <p className="text-q-muted text-sm mb-4">Come back in:</p>
              <Countdown seconds={countdown} />
              <p className="text-q-muted text-xs mt-4">
                Keep your {data.streak}-day streak! 🔥
              </p>
            </>
          )}

          {txHash && (
            <div className="tx-success w-full mt-4">
              ✓ Confirmed!{' '}
              <a href={`https://testnet.arcscan.app/tx/${txHash}`} target="_blank" rel="noopener noreferrer"
                 className="underline">View tx ↗</a>
            </div>
          )}
          {error && <div className="tx-error w-full mt-4">{error}</div>}
        </div>

        {/* Streak multipliers */}
        <div className="card">
          <h3 className="text-q-text font-semibold mb-4 flex items-center gap-2 text-sm">
            <Flame size={14} className="text-orange-400" /> Streak Bonus
          </h3>
          <div className="flex flex-col gap-2">
            {[
              { days: 1,  pts: 10, label: 'Day 1' },
              { days: 2,  pts: 15, label: 'Day 2' },
              { days: 3,  pts: 20, label: 'Day 3' },
              { days: 5,  pts: 30, label: 'Day 5' },
              { days: 7,  pts: 40, label: 'Day 7' },
              { days: 10, pts: 60, label: 'Day 10+' },
            ].map(({ days, pts, label }) => {
              const active = data.streak >= days
              return (
                <div key={days} className={clsx(
                  'flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm transition-all',
                  active ? 'bg-q-blue/10 border-q-blue/30 text-q-blue' : 'bg-q-surface border-q-border text-q-muted'
                )}>
                  <div className="flex items-center gap-2">
                    {active && <div className="w-1.5 h-1.5 bg-q-blue rounded-full" />}
                    <span>{label}</span>
                  </div>
                  <span className="font-mono font-semibold">{pts} pts</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="card mt-5">
        <h3 className="text-q-text font-semibold mb-4 flex items-center gap-2 text-sm">
          <Calendar size={14} className="text-q-blue" /> Activity — Last 5 Weeks
        </h3>
        <div className="grid grid-cols-7 gap-1.5 mb-3">
          {['S','M','T','W','T','F','S'].map((d, i) => (
            <div key={i} className="text-center text-[10px] text-q-muted pb-1">{d}</div>
          ))}
          {calDays.map((day, i) => {
            const isToday  = day.toDateString() === new Date().toDateString()
            const isPast   = day < new Date() && !isToday
            const isActive = data.totalCheckIns > 0 && isPast && i >= 35 - data.totalCheckIns
            return (
              <div key={i} title={day.toLocaleDateString()}
                className={clsx(
                  'aspect-square rounded-md transition-all duration-200',
                  isToday && 'ring-1 ring-q-blue ring-offset-1 ring-offset-q-card',
                  isActive ? 'bg-q-blue/60 shadow-[0_0_8px_rgba(59,130,246,0.4)]'
                           : 'bg-q-dim/50'
                )}
              />
            )
          })}
        </div>
        <div className="flex items-center gap-4 text-xs text-q-muted">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-q-dim/50" /> Missed</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-q-blue/60" /> Checked</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded ring-1 ring-q-blue bg-q-dim/50" /> Today</div>
        </div>
      </div>
    </div>
  )
}
