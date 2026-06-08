'use client'
import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import { useWeb3 } from '@/lib/web3'
import { ADDR, STAKE_POOL_ABI, POINT_TOKEN_ABI } from '@/lib/contracts'
import { Layers, Zap, TrendingUp, Clock, Gift, AlertTriangle, Plus, Minus, BarChart3 } from 'lucide-react'
import clsx from 'clsx'

export default function StakePage() {
  const { signer, address, balance, isConnected, isCorrectNetwork, refresh, connect, switchNet } = useWeb3()
  const [info,     setInfo]     = useState({ staked: '0', stakedAt: 0, pending: '0' })
  const [livePts,  setLivePts]  = useState(0)
  const [total,    setTotal]    = useState('0')
  const [sAmt,     setSAmt]     = useState('')
  const [uAmt,     setUAmt]     = useState('')
  const [tab,      setTab]      = useState<'stake'|'unstake'>('stake')
  const [loading,  setLoading]  = useState(false)
  const [needApproval, setNeedApproval] = useState(false)
  const [txHash,   setTxHash]   = useState('')
  const [error,    setError]    = useState('')

  const load = useCallback(async () => {
    if (!signer || !address) return
    try {
      const sc = new ethers.Contract(ADDR.STAKE_POOL, STAKE_POOL_ABI, signer)
      const [staked, at, pending] = await sc.getStakeInfo(address)
      setInfo({ staked: ethers.formatEther(staked), stakedAt: Number(at), pending: ethers.formatEther(pending) })
      setLivePts(parseFloat(ethers.formatEther(pending)))
      setTotal(ethers.formatEther(await sc.totalStaked()))
      const pc = new ethers.Contract(ADDR.POINT_TOKEN, POINT_TOKEN_ABI, signer)
      const allow = await pc.allowance(address, ADDR.STAKE_POOL)
      setNeedApproval(allow === 0n)
    } catch (e) { console.error(e) }
  }, [signer, address])

  useEffect(() => { load() }, [load])

  // Tick pending rewards every second
  useEffect(() => {
    const staked = parseFloat(info.staked)
    if (!staked) return
    const rate = (staked * 0.01) / 86400
    const id = setInterval(() => setLivePts(p => parseFloat((p + rate).toFixed(8))), 1000)
    return () => clearInterval(id)
  }, [info.staked])

  const approve = async () => {
    if (!signer) return; setLoading(true); setError('')
    try {
      const c = new ethers.Contract(ADDR.POINT_TOKEN, POINT_TOKEN_ABI, signer)
      const tx = await c.approve(ADDR.STAKE_POOL, ethers.MaxUint256)
      await tx.wait(); setNeedApproval(false)
    } catch (e: any) { setError(e?.reason || 'Approval failed') }
    finally { setLoading(false) }
  }

  const doStake = async () => {
    if (!signer || !sAmt) return; setLoading(true); setError(''); setTxHash('')
    try {
      const c = new ethers.Contract(ADDR.STAKE_POOL, STAKE_POOL_ABI, signer)
      const tx = await c.stake(ethers.parseEther(sAmt))
      setTxHash(tx.hash); await tx.wait(); setSAmt('')
      await load(); await refresh()
    } catch (e: any) { setError(e?.reason || 'Stake failed') }
    finally { setLoading(false) }
  }

  const doUnstake = async () => {
    if (!signer || !uAmt) return; setLoading(true); setError(''); setTxHash('')
    try {
      const c = new ethers.Contract(ADDR.STAKE_POOL, STAKE_POOL_ABI, signer)
      const tx = await c.unstake(ethers.parseEther(uAmt))
      setTxHash(tx.hash); await tx.wait(); setUAmt('')
      await load(); await refresh()
    } catch (e: any) { setError(e?.reason || 'Unstake failed') }
    finally { setLoading(false) }
  }

  const doClaim = async () => {
    if (!signer) return; setLoading(true); setError(''); setTxHash('')
    try {
      const c = new ethers.Contract(ADDR.STAKE_POOL, STAKE_POOL_ABI, signer)
      const tx = await c.claimRewards()
      setTxHash(tx.hash); await tx.wait()
      await load(); await refresh()
    } catch (e: any) { setError(e?.reason || 'Claim failed') }
    finally { setLoading(false) }
  }

  const staked    = parseFloat(info.staked)
  const daily     = staked * 0.01
  const walletBal = parseFloat(balance)

  if (!isConnected) return (
    <div className="max-w-lg mx-auto px-4 pt-24 text-center">
      <Layers size={52} className="text-q-purple mx-auto mb-5 animate-float" />
      <h1 className="font-orb text-4xl tracking-widest text-q-text mb-3">STAKE</h1>
      <p className="text-q-muted mb-8">Connect your wallet to stake your points.</p>
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
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8 animate-[appear_0.3s_ease-out]">
        <span className="text-xs font-mono text-q-purple bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full">
          YIELD QUEST
        </span>
        <h1 className="font-orb text-4xl sm:text-5xl tracking-widest text-q-text mt-2">
          <span style={{ color: '#8b5cf6', textShadow: '0 0 20px rgba(139,92,246,0.7)' }}>STAKE</span>
        </h1>
        <p className="text-q-muted mt-1 text-sm">Stake AQP points and earn 1% daily. 365% APR.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="stat">
          <Layers size={15} className="text-q-purple mb-1" />
          <div className="stat-val text-q-purple">{staked.toFixed(1)}</div>
          <div className="stat-label">Staked (AQP)</div>
        </div>
        <div className="stat relative overflow-hidden">
          <Gift size={15} className="text-q-gold mb-1" />
          <div className="stat-val text-q-gold">{livePts.toFixed(6)}</div>
          <div className="stat-label">Pending ⚡ live</div>
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-q-gold/30 to-transparent" />
        </div>
        <div className="stat">
          <TrendingUp size={15} className="text-q-green mb-1" />
          <div className="stat-val text-q-green">{daily.toFixed(2)}</div>
          <div className="stat-label">Daily Earning</div>
        </div>
        <div className="stat">
          <BarChart3 size={15} className="text-q-blue mb-1" />
          <div className="stat-val">365%</div>
          <div className="stat-label">APR</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Stake/Unstake form */}
        <div className="card">
          {/* Tabs */}
          <div className="flex gap-2 mb-5">
            <button onClick={() => setTab('stake')}
              className={clsx('flex-1 py-2 rounded-lg text-sm font-semibold transition-all',
                tab === 'stake'
                  ? 'bg-grd-purple text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                  : 'bg-q-surface border border-q-border text-q-muted hover:text-q-text')}>
              <Plus size={13} className="inline mr-1" /> Stake
            </button>
            <button onClick={() => setTab('unstake')}
              className={clsx('flex-1 py-2 rounded-lg text-sm font-semibold transition-all',
                tab === 'unstake'
                  ? 'bg-q-surface border border-q-blue/30 text-q-blue'
                  : 'bg-q-surface border border-q-border text-q-muted hover:text-q-text')}>
              <Minus size={13} className="inline mr-1" /> Unstake
            </button>
          </div>

          {tab === 'stake' ? (
            <>
              <div className="flex justify-between text-xs text-q-muted mb-1.5">
                <span>Amount</span>
                <span>Available: <span className="text-q-text">{walletBal.toFixed(1)} AQP</span></span>
              </div>
              <div className="relative mb-4">
                <input type="number" value={sAmt} onChange={e => setSAmt(e.target.value)}
                  placeholder="0.0" className="input pr-14" />
                <button onClick={() => setSAmt(walletBal.toString())}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-q-blue text-xs hover:underline">MAX</button>
              </div>
              {sAmt && parseFloat(sAmt) > 0 && (
                <div className="bg-purple-500/5 border border-purple-500/15 rounded-lg p-3 mb-4 text-xs space-y-1">
                  <div className="flex justify-between text-q-muted">
                    <span>Daily earning</span>
                    <span className="text-q-green">+{(parseFloat(sAmt) * 0.01).toFixed(2)} AQP</span>
                  </div>
                  <div className="flex justify-between text-q-muted">
                    <span>30-day total</span>
                    <span className="text-q-green">+{(parseFloat(sAmt) * 0.01 * 30).toFixed(1)} AQP</span>
                  </div>
                </div>
              )}
              {needApproval ? (
                <button onClick={approve} disabled={loading}
                  className="btn w-full py-3 text-sm font-semibold text-white bg-grd-purple hover:brightness-110 disabled:opacity-40 active:scale-[0.98] transition-all">
                  {loading ? 'Approving…' : 'Approve AQP First'}
                </button>
              ) : (
                <button onClick={doStake} disabled={loading || !sAmt || parseFloat(sAmt) <= 0}
                  className="btn w-full py-3 text-sm font-semibold text-white bg-grd-purple hover:brightness-110 hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] disabled:opacity-40 active:scale-[0.98] transition-all">
                  {loading
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Staking…</>
                    : <><Layers size={15} /> Stake AQP</>}
                </button>
              )}
            </>
          ) : (
            <>
              <div className="flex justify-between text-xs text-q-muted mb-1.5">
                <span>Amount</span>
                <span>Staked: <span className="text-q-text">{staked.toFixed(1)} AQP</span></span>
              </div>
              <div className="relative mb-4">
                <input type="number" value={uAmt} onChange={e => setUAmt(e.target.value)}
                  placeholder="0.0" className="input pr-14" />
                <button onClick={() => setUAmt(staked.toString())}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-q-blue text-xs hover:underline">MAX</button>
              </div>
              <button onClick={doUnstake} disabled={loading || !uAmt || parseFloat(uAmt) <= 0 || !staked}
                className="btn-outline w-full py-3 text-sm border-purple-500/40 text-q-purple hover:border-purple-500 disabled:opacity-40">
                {loading ? 'Unstaking…' : 'Unstake AQP'}
              </button>
            </>
          )}

          {txHash && (
            <div className="tx-success">
              ✓ Success!{' '}
              <a href={`https://testnet.arcscan.app/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="underline">View tx ↗</a>
            </div>
          )}
          {error && <div className="tx-error">{error}</div>}
        </div>

        {/* Rewards panel */}
        <div className="flex flex-col gap-4">
          {/* Live rewards card */}
          <div className="card border-q-gold/20" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.05) 0%, rgba(13,18,32,0.9) 100%)' }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-q-text font-semibold text-sm flex items-center gap-2">
                <Gift size={15} className="text-q-gold" /> Pending Rewards
              </h3>
              <span className="text-xs text-q-gold bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded-full animate-pulse-slow">
                LIVE
              </span>
            </div>
            <div className="text-center py-3">
              <p className="font-mono text-4xl font-semibold text-q-gold"
                 style={{ textShadow: '0 0 20px rgba(245,158,11,0.5)' }}>
                {livePts.toFixed(6)}
              </p>
              <p className="text-q-muted text-xs mt-1">AQP Points</p>
            </div>
            <button onClick={doClaim}
              disabled={loading || livePts < 0.0001 || !staked}
              className="btn w-full py-2.5 text-sm font-semibold text-white bg-grd-gold disabled:opacity-40 hover:brightness-110 active:scale-[0.98] transition-all">
              {loading ? 'Claiming…' : <><Gift size={15} /> Claim Rewards</>}
            </button>
          </div>

          {/* Pool info */}
          <div className="card">
            <h3 className="text-q-text font-semibold mb-3 flex items-center gap-2 text-sm">
              <Clock size={14} className="text-q-muted" /> Pool Info
            </h3>
            <div className="space-y-2 text-sm">
              {[
                { k: 'APR', v: '365%', c: 'text-q-green' },
                { k: 'Daily Rate', v: '1%', c: 'text-q-text' },
                { k: 'Total Pool', v: `${parseFloat(total).toFixed(1)} AQP`, c: 'text-q-text' },
                ...(info.stakedAt > 0 ? [{ k: 'Staked Since', v: new Date(info.stakedAt * 1000).toLocaleDateString(), c: 'text-q-text' }] : []),
              ].map(({ k, v, c }) => (
                <div key={k} className="flex justify-between">
                  <span className="text-q-muted">{k}</span>
                  <span className={`font-semibold ${c}`}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
