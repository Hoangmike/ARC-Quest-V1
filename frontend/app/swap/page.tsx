'use client'
import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import { useWeb3 } from '@/lib/web3'
import { ADDR, MOCK_SWAP_ABI } from '@/lib/contracts'
import { ArrowLeftRight, Zap, TrendingUp, AlertTriangle, Info, ArrowDownUp } from 'lucide-react'

export default function SwapPage() {
  const { signer, address, isConnected, isCorrectNetwork, refresh, connect, switchNet } = useWeb3()
  const [amount,   setAmount]  = useState('')
  const [rate,     setRate]    = useState(100)
  const [stats,    setStats]   = useState({ vol: '0', count: 0 })
  const [native,   setNative]  = useState('0')
  const [loading,  setLoading] = useState(false)
  const [txHash,   setTxHash]  = useState('')
  const [error,    setError]   = useState('')

  const pts = amount ? parseFloat(amount) * rate : 0

  const load = useCallback(async () => {
    if (!signer || !address) return
    try {
      const c = new ethers.Contract(ADDR.MOCK_SWAP, MOCK_SWAP_ABI, signer)
      setRate(Number(await c.pointsPerUsdc()))
      const [v, n] = await c.getUserStats(address)
      setStats({ vol: ethers.formatEther(v), count: Number(n) })
      const bal = await signer.provider!.getBalance(address)
      setNative(ethers.formatEther(bal))
    } catch (e) { console.error(e) }
  }, [signer, address])

  useEffect(() => { load() }, [load])

  const doSwap = async () => {
    if (!signer || !amount) return
    setLoading(true); setError(''); setTxHash('')
    try {
      const c = new ethers.Contract(ADDR.MOCK_SWAP, MOCK_SWAP_ABI, signer)
      const tx = await c.swap({ value: ethers.parseEther(amount) })
      setTxHash(tx.hash)
      await tx.wait()
      setAmount('')
      await load(); await refresh()
    } catch (e: any) { setError(e?.reason || e?.message?.split('(')[0] || 'Failed') }
    finally { setLoading(false) }
  }

  if (!isConnected) return (
    <div className="max-w-lg mx-auto px-4 pt-24 text-center">
      <ArrowLeftRight size={52} className="text-q-cyan mx-auto mb-5 animate-float" />
      <h1 className="font-orb text-4xl tracking-widest text-q-text mb-3">SWAP</h1>
      <p className="text-q-muted mb-8">Connect your wallet to start swapping.</p>
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
        <span className="text-xs font-mono text-q-cyan bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full">
          DEX QUEST
        </span>
        <h1 className="font-orb text-4xl sm:text-5xl tracking-widest text-q-text mt-2">
          <span className="text-q-cyan cyan-glow-text">SWAP</span>
        </h1>
        <p className="text-q-muted mt-1 text-sm">Swap USDC and earn points proportional to your volume.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="stat">
          <TrendingUp size={15} className="text-q-cyan mb-1" />
          <div className="stat-val text-q-cyan">{parseFloat(stats.vol).toFixed(3)}</div>
          <div className="stat-label">USDC Swapped</div>
        </div>
        <div className="stat">
          <ArrowLeftRight size={15} className="text-q-cyan mb-1" />
          <div className="stat-val">{stats.count}</div>
          <div className="stat-label">Total Swaps</div>
        </div>
        <div className="stat">
          <Zap size={15} className="text-q-blue mb-1" />
          <div className="stat-val">{rate}</div>
          <div className="stat-label">pts / USDC</div>
        </div>
      </div>

      <div className="grid md:grid-cols-5 gap-5">
        {/* Swap form */}
        <div className="md:col-span-3 card">
          <h2 className="text-q-text font-semibold mb-5 flex items-center gap-2 text-sm">
            <ArrowLeftRight size={15} className="text-q-cyan" /> USDC → AQP Points
          </h2>

          {/* From */}
          <div className="mb-2">
            <div className="flex justify-between text-xs text-q-muted mb-1.5">
              <span>You send</span>
              <span>Balance: <span className="text-q-text">{parseFloat(native).toFixed(4)} USDC</span></span>
            </div>
            <div className="bg-q-surface border border-q-border rounded-xl p-4
                            focus-within:border-q-blue/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                    placeholder="0.0" min="0" step="0.001"
                    className="w-full bg-transparent text-q-text text-2xl font-mono outline-none
                               placeholder:text-q-dim" />
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2 bg-q-card border border-q-border rounded-lg px-3 py-1.5">
                    <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                      <span className="text-white text-[10px] font-bold">$</span>
                    </div>
                    <span className="text-q-text text-sm font-semibold">USDC</span>
                  </div>
                  <button onClick={() => {
                    const b = parseFloat(native)
                    if (b > 0.001) setAmount((b - 0.001).toFixed(4))
                  }} className="text-q-blue text-[10px] hover:underline">MAX</button>
                </div>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center my-2">
            <div className="w-8 h-8 rounded-full bg-q-surface border border-q-border
                            flex items-center justify-center">
              <ArrowDownUp size={14} className="text-q-cyan" />
            </div>
          </div>

          {/* To */}
          <div className="mb-5">
            <div className="text-xs text-q-muted mb-1.5">You receive (estimated)</div>
            <div className="bg-q-surface border border-q-border rounded-xl p-4
                            flex items-center justify-between">
              <span className="font-mono text-2xl font-semibold text-q-cyan cyan-glow-text">
                {pts > 0 ? `+${pts.toFixed(0)}` : '0'}
              </span>
              <div className="flex items-center gap-2 bg-q-card border border-q-cyan/20 rounded-lg px-3 py-1.5">
                <Zap size={13} className="text-q-cyan fill-q-cyan" />
                <span className="text-q-cyan text-sm font-semibold">AQP</span>
              </div>
            </div>
          </div>

          {/* Rate info */}
          {amount && parseFloat(amount) > 0 && (
            <div className="bg-q-surface border border-q-border rounded-lg px-3 py-2 mb-4 text-xs text-q-muted flex justify-between">
              <span>Exchange rate</span>
              <span className="text-q-text">1 USDC = <span className="text-q-cyan font-mono">{rate} AQP</span></span>
            </div>
          )}

          <button onClick={doSwap} disabled={loading || !amount || parseFloat(amount) <= 0}
            className="btn w-full py-3 text-sm font-semibold text-white
                       bg-gradient-to-r from-sky-700 to-cyan-500
                       hover:brightness-110 hover:shadow-cyan
                       shadow-[0_0_20px_rgba(6,182,212,0.2)]
                       disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all">
            {loading
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Swapping…</>
              : <><ArrowLeftRight size={16} /> Swap Now</>}
          </button>

          {txHash && (
            <div className="tx-success">
              ✓ Swap successful!{' '}
              <a href={`https://testnet.arcscan.app/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="underline">View tx ↗</a>
            </div>
          )}
          {error && <div className="tx-error">{error}</div>}
        </div>

        {/* Info */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <div className="card">
            <h3 className="text-q-text font-semibold mb-3 flex items-center gap-2 text-sm">
              <Info size={14} className="text-q-cyan" /> How It Works
            </h3>
            <div className="flex flex-col gap-3">
              {[
                { n: 1, t: 'Enter USDC amount to swap' },
                { n: 2, t: `Contract mints ${rate} AQP per 1 USDC sent` },
                { n: 3, t: 'Points go directly to your wallet' },
              ].map(({ n, t }) => (
                <div key={n} className="flex gap-2.5 text-xs text-q-muted">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-q-cyan text-[10px] flex items-center justify-center shrink-0">{n}</span>
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card bg-amber-500/5 border-amber-500/20">
            <p className="text-xs text-q-muted flex gap-2">
              <AlertTriangle size={13} className="text-amber-400 shrink-0 mt-0.5" />
              Testnet only. Get USDC from{' '}
              <a href="https://faucet.circle.com" target="_blank" rel="noopener noreferrer"
                 className="text-q-blue underline">faucet.circle.com ↗</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
