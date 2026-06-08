'use client'
import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import { useWeb3 } from '@/lib/web3'
import { ADDR, BADGE_NFT_ABI, POINT_TOKEN_ABI } from '@/lib/contracts'
import { Award, Zap, Lock, CheckCircle2, Star, Gem, Crown, Shield, AlertTriangle } from 'lucide-react'
import clsx from 'clsx'

const RARITY = [
  { label: 'Common',    icon: Shield, cls: 'rarity-common',    glow: '',
    gradient: 'from-slate-600 to-slate-500', ring: 'ring-slate-500/30' },
  { label: 'Rare',      icon: Star,   cls: 'rarity-rare',      glow: 'shadow-[0_0_20px_rgba(59,130,246,0.35)]',
    gradient: 'from-blue-700 to-blue-500',   ring: 'ring-blue-500/40' },
  { label: 'Epic',      icon: Gem,    cls: 'rarity-epic',      glow: 'shadow-[0_0_25px_rgba(139,92,246,0.4)]',
    gradient: 'from-violet-700 to-purple-500', ring: 'ring-purple-500/40' },
  { label: 'Legendary', icon: Crown,  cls: 'rarity-legendary', glow: 'shadow-gold',
    gradient: 'from-yellow-600 to-amber-400', ring: 'ring-yellow-500/50' },
]

const BADGE_ICONS = ['🌱','📅','🎯','🔄','🏦','⚔️','💎','⭐']

interface BadgeType {
  id: bigint; name: string; description: string; pointCost: bigint
  rarity: number; active: boolean; totalMinted: bigint; maxSupply: bigint
}

export default function BadgesPage() {
  const { signer, address, balance, isConnected, isCorrectNetwork, refresh, connect, switchNet } = useWeb3()
  const [badges,   setBadges]   = useState<BadgeType[]>([])
  const [owned,    setOwned]    = useState<Record<string, boolean>>({})
  const [ownCnt,   setOwnCnt]   = useState(0)
  const [loading,  setLoading]  = useState(false)
  const [mintingId,setMintingId]= useState<string | null>(null)
  const [txMap,    setTxMap]    = useState<Record<string, string>>({})
  const [errMap,   setErrMap]   = useState<Record<string, string>>({})
  const [filter,   setFilter]   = useState<number|null>(null)
  const [tab,      setTab]      = useState<'all'|'owned'>('all')

  const load = useCallback(async () => {
    if (!signer || !address) return
    setLoading(true)
    try {
      const c = new ethers.Contract(ADDR.BADGE_NFT, BADGE_NFT_ABI, signer)
      const list = await c.getAllBadgeTypes()
      setBadges(list)
      setOwnCnt(Number(await c.balanceOf(address)))
      const map: Record<string, boolean> = {}
      for (const b of list) map[b.id.toString()] = await c.hasMinted(address, b.id)
      setOwned(map)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [signer, address])

  useEffect(() => { load() }, [load])

  const mint = async (badgeId: bigint) => {
    if (!signer) return
    const id = badgeId.toString()
    setMintingId(id); setErrMap(p => ({ ...p, [id]: '' })); setTxMap(p => ({ ...p, [id]: '' }))
    try {
      const c = new ethers.Contract(ADDR.BADGE_NFT, BADGE_NFT_ABI, signer)
      const tx = await c.mintBadge(badgeId)
      setTxMap(p => ({ ...p, [id]: tx.hash }))
      await tx.wait(); await load(); await refresh()
    } catch (e: any) { setErrMap(p => ({ ...p, [id]: e?.reason || 'Mint failed' })) }
    finally { setMintingId(null) }
  }

  const bal      = parseFloat(balance)
  const shown    = badges.filter(b => {
    if (tab === 'owned') return owned[b.id.toString()]
    if (filter !== null) return b.rarity === filter
    return true
  })

  if (!isConnected) return (
    <div className="max-w-lg mx-auto px-4 pt-24 text-center">
      <Award size={52} className="text-q-gold mx-auto mb-5 animate-float" />
      <h1 className="font-orb text-4xl tracking-widest text-q-text mb-3">BADGES</h1>
      <p className="text-q-muted mb-8">Connect your wallet to collect badges.</p>
      <button onClick={connect} className="btn-primary px-8 py-3">Connect Wallet</button>
    </div>
  )
  if (!isCorrectNetwork) return (
    <div className="max-w-lg mx-auto px-4 pt-24 text-center">
      <AlertTriangle size={52} className="text-amber-400 mx-auto mb-5" />
      <button onClick={switchNet} className="btn-primary px-8 py-3">Switch to Arc Testnet</button>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8 animate-[appear_0.3s_ease-out]">
        <span className="text-xs font-mono text-q-gold bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 rounded-full">
          COLLECT QUEST
        </span>
        <h1 className="font-orb text-4xl sm:text-5xl tracking-widest text-q-text mt-2">
          <span className="text-q-gold" style={{ textShadow: '0 0 25px rgba(245,158,11,0.5)' }}>BADGES</span>
        </h1>
        <p className="text-q-muted mt-1 text-sm">Burn AQP points to mint exclusive NFT badges. 4 rarity tiers.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="stat">
          <Zap size={15} className="text-q-blue mb-1" />
          <div className="stat-val text-q-blue">{bal.toFixed(1)}</div>
          <div className="stat-label">Your Points</div>
        </div>
        <div className="stat">
          <Award size={15} className="text-q-gold mb-1" />
          <div className="stat-val">{ownCnt}</div>
          <div className="stat-label">Badges Owned</div>
        </div>
        <div className="stat">
          <Star size={15} className="text-q-purple mb-1" />
          <div className="stat-val">{badges.length}</div>
          <div className="stat-label">Total Available</div>
        </div>
      </div>

      {/* Rarity legend */}
      <div className="flex flex-wrap gap-2 mb-5 p-3 bg-q-surface border border-q-border rounded-xl">
        {RARITY.map((r, i) => {
          const Icon = r.icon
          return (
            <div key={i} className={clsx('flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs', r.cls)}>
              <Icon size={12} /> {r.label}
            </div>
          )
        })}
        <div className="ml-auto text-xs text-q-muted flex items-center">
          Rarer = more points required
        </div>
      </div>

      {/* Tabs & filters */}
      <div className="flex flex-wrap gap-2 mb-5">
        <button onClick={() => { setTab('all'); setFilter(null) }}
          className={tab === 'all' && filter === null ? 'tab-active' : 'tab'}>
          All ({badges.length})
        </button>
        <button onClick={() => { setTab('owned'); setFilter(null) }}
          className={tab === 'owned' ? 'tab' : 'tab'}
          style={tab === 'owned' ? { background: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.3)', color: '#f59e0b', border: '1px solid' } : {}}>
          My Badges ({ownCnt})
        </button>
        {tab === 'all' && RARITY.map((r, i) => {
          const Icon = r.icon
          const n = badges.filter(b => b.rarity === i).length
          if (!n) return null
          return (
            <button key={i} onClick={() => setFilter(filter === i ? null : i)}
              className={clsx('tab flex items-center gap-1', filter === i ? clsx(r.cls, 'border') : '')}>
              <Icon size={11} /> {r.label} ({n})
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="text-center py-20 text-q-muted">Loading badges…</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {shown.map((badge, idx) => {
            const id      = badge.id.toString()
            const isOwned = owned[id]
            const isMinting = mintingId === id
            const cost    = Number(badge.pointCost) / 1e18
            const canAfford = bal >= cost
            const soldOut = Number(badge.maxSupply) > 0 && Number(badge.totalMinted) >= Number(badge.maxSupply)
            const r       = RARITY[badge.rarity]
            const Icon    = r.icon
            const emoji   = BADGE_ICONS[idx % BADGE_ICONS.length]
            const hasProg = Number(badge.maxSupply) > 0
            const progress = hasProg ? (Number(badge.totalMinted) / Number(badge.maxSupply)) * 100 : 0

            return (
              <div key={id} className={clsx(
                'card shine flex flex-col transition-all duration-300',
                isOwned ? `border-q-gold/25 ${r.glow}` : canAfford ? `hover:${r.glow} card-glow` : 'opacity-70'
              )}>
                {/* Art */}
                <div className={clsx(
                  'w-full aspect-square rounded-xl flex flex-col items-center justify-center mb-4',
                  `bg-gradient-to-br ${r.gradient} bg-opacity-10`,
                  isOwned ? `ring-2 ${r.ring}` : 'ring-1 ring-q-border'
                )}>
                  <span className="text-4xl mb-2">{emoji}</span>
                  {isOwned && (
                    <span className="flex items-center gap-1 text-q-gold text-[10px] font-semibold bg-yellow-500/20 px-2 py-0.5 rounded-full">
                      <CheckCircle2 size={10} /> OWNED
                    </span>
                  )}
                </div>

                {/* Rarity label */}
                <div className={clsx('inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md border w-fit mb-2', r.cls)}>
                  <Icon size={9} /> {r.label}
                </div>

                <p className="text-q-text font-semibold text-sm mb-1">{badge.name}</p>
                <p className="text-q-muted text-xs leading-relaxed mb-3 flex-1">{badge.description}</p>

                {/* Supply bar */}
                {hasProg && (
                  <div className="mb-3">
                    <div className="flex justify-between text-[10px] text-q-muted mb-1">
                      <span>{Number(badge.totalMinted)} minted</span>
                      <span>/{Number(badge.maxSupply)}</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${Math.min(100, progress)}%` }} />
                    </div>
                  </div>
                )}

                {/* Action row */}
                <div className="flex items-center justify-between gap-2 mt-auto">
                  <div className="flex items-center gap-1">
                    <Zap size={11} className="text-q-blue fill-q-blue" />
                    <span className="text-q-blue font-mono text-sm font-semibold">{cost}</span>
                    <span className="text-q-muted text-[10px]">pts</span>
                  </div>
                  {isOwned ? (
                    <span className="text-q-gold text-[10px] flex items-center gap-1">
                      <CheckCircle2 size={10} /> Collected
                    </span>
                  ) : soldOut ? (
                    <span className="text-q-muted text-[10px]">Sold out</span>
                  ) : (
                    <button onClick={() => mint(badge.id)} disabled={isMinting || !canAfford}
                      className={clsx(
                        'flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border font-medium transition-all active:scale-[0.97]',
                        canAfford
                          ? 'bg-yellow-500/10 border-yellow-500/25 text-q-gold hover:bg-yellow-500/20'
                          : 'bg-q-dim/20 border-q-border text-q-muted cursor-not-allowed'
                      )}>
                      {isMinting
                        ? <span className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                        : canAfford
                          ? <><Award size={11} /> Mint</>
                          : <><Lock size={11} /> {(cost - bal).toFixed(0)} more</>}
                    </button>
                  )}
                </div>

                {txMap[id] && (
                  <p className="text-q-green text-[10px] mt-2">
                    ✓ Minted!{' '}
                    <a href={`https://testnet.arcscan.app/tx/${txMap[id]}`} target="_blank" rel="noopener noreferrer" className="underline">View ↗</a>
                  </p>
                )}
                {errMap[id] && <p className="text-q-red text-[10px] mt-2">{errMap[id]}</p>}
              </div>
            )
          })}
          {shown.length === 0 && (
            <div className="col-span-full text-center py-20 text-q-muted text-sm">
              {tab === 'owned' ? 'No badges yet. Start earning points!' : 'No badges found.'}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
