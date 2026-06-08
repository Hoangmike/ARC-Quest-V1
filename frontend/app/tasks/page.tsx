'use client'
import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import { useWeb3 } from '@/lib/web3'
import { ADDR, TASK_MANAGER_ABI } from '@/lib/contracts'
import { ListTodo, CheckCircle2, Circle, Zap, Twitter, Link2, Users, Star, AlertTriangle } from 'lucide-react'
import clsx from 'clsx'

const TYPE_META = [
  { label: 'Social',    icon: Twitter, color: 'text-sky-400',    bg: 'bg-sky-500/10 border-sky-500/25' },
  { label: 'On-Chain',  icon: Link2,   color: 'text-q-cyan',     bg: 'bg-cyan-500/10 border-cyan-500/25' },
  { label: 'Community', icon: Users,   color: 'text-q-green',    bg: 'bg-green-500/10 border-green-500/25' },
  { label: 'Special',   icon: Star,    color: 'text-q-gold',     bg: 'bg-yellow-500/10 border-yellow-500/25' },
]

interface Task {
  id: bigint; title: string; description: string; pointReward: bigint
  taskType: number; active: boolean; completionCount: bigint; maxCompletions: bigint
}

export default function TasksPage() {
  const { signer, address, isConnected, isCorrectNetwork, refresh, connect, switchNet } = useWeb3()
  const [tasks,    setTasks]    = useState<Task[]>([])
  const [done,     setDone]     = useState<Record<string, boolean>>({})
  const [total,    setTotal]    = useState(0)
  const [loading,  setLoading]  = useState(false)
  const [claiming, setClaiming] = useState<string | null>(null)
  const [txMap,    setTxMap]    = useState<Record<string, string>>({})
  const [errMap,   setErrMap]   = useState<Record<string, string>>({})
  const [filter,   setFilter]   = useState<number | null>(null)

  const load = useCallback(async () => {
    if (!signer || !address) return
    setLoading(true)
    try {
      const c = new ethers.Contract(ADDR.TASK_MANAGER, TASK_MANAGER_ABI, signer)
      const list = await c.getActiveTasks()
      setTasks(list)
      setTotal(Number(await c.totalTasksCompleted(address)))
      const map: Record<string, boolean> = {}
      for (const t of list) map[t.id.toString()] = await c.hasCompleted(address, t.id)
      setDone(map)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [signer, address])

  useEffect(() => { load() }, [load])

  const claim = async (taskId: bigint) => {
    if (!signer) return
    const id = taskId.toString()
    setClaiming(id); setErrMap(p => ({ ...p, [id]: '' })); setTxMap(p => ({ ...p, [id]: '' }))
    try {
      const c = new ethers.Contract(ADDR.TASK_MANAGER, TASK_MANAGER_ABI, signer)
      const tx = await c.completeTask(taskId)
      setTxMap(p => ({ ...p, [id]: tx.hash }))
      await tx.wait()
      await load(); await refresh()
    } catch (e: any) { setErrMap(p => ({ ...p, [id]: e?.reason || 'Failed' })) }
    finally { setClaiming(null) }
  }

  const shown    = filter !== null ? tasks.filter(t => t.taskType === filter) : tasks
  const doneCount = Object.values(done).filter(Boolean).length

  if (!isConnected) return (
    <div className="max-w-lg mx-auto px-4 pt-24 text-center">
      <ListTodo size={52} className="text-indigo-400 mx-auto mb-5 animate-float" />
      <h1 className="font-orb text-4xl tracking-widest text-q-text mb-3">TASKS</h1>
      <p className="text-q-muted mb-8">Connect your wallet to see tasks.</p>
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
        <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
          COMMUNITY QUEST
        </span>
        <h1 className="font-orb text-4xl sm:text-5xl tracking-widest text-q-text mt-2">
          TASKS
        </h1>
        <p className="text-q-muted mt-1 text-sm">Complete one-time tasks to earn points.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="stat">
          <ListTodo size={15} className="text-indigo-400 mb-1" />
          <div className="stat-val">{tasks.length}</div>
          <div className="stat-label">Available</div>
        </div>
        <div className="stat">
          <CheckCircle2 size={15} className="text-q-green mb-1" />
          <div className="stat-val text-q-green">{doneCount}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat">
          <Zap size={15} className="text-q-blue mb-1" />
          <div className="stat-val">{total}</div>
          <div className="stat-label">All Time</div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2 mb-5">
        <button onClick={() => setFilter(null)} className={filter === null ? 'tab-active' : 'tab'}>
          All ({tasks.length})
        </button>
        {TYPE_META.map((m, i) => {
          const n = tasks.filter(t => t.taskType === i).length
          if (!n) return null
          return (
            <button key={i} onClick={() => setFilter(i)}
              className={filter === i ? 'tab-active' : 'tab'}>
              {m.label} ({n})
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="text-center py-20 text-q-muted text-sm">Loading tasks…</div>
      ) : (
        <div className="flex flex-col gap-3">
          {shown.map(task => {
            const id   = task.id.toString()
            const meta = TYPE_META[task.taskType] || TYPE_META[2]
            const Icon = meta.icon
            const pts  = Number(task.pointReward) / 1e18
            const isDone    = done[id]
            const isClaiming = claiming === id
            const isFull    = Number(task.maxCompletions) > 0 && Number(task.completionCount) >= Number(task.maxCompletions)
            return (
              <div key={id} className={clsx(
                'card shine transition-all duration-300',
                isDone ? 'opacity-55 border-q-green/15' : 'card-glow'
              )}>
                <div className="flex items-start gap-4">
                  <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border', meta.bg)}>
                    <Icon size={17} className={meta.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={clsx('text-xs px-2 py-0.5 rounded-md border', meta.bg, meta.color)}>
                        {meta.label}
                      </span>
                      {isDone && (
                        <span className="text-xs px-2 py-0.5 rounded-md bg-q-green/10 border border-q-green/20 text-q-green flex items-center gap-1">
                          <CheckCircle2 size={11} /> Done
                        </span>
                      )}
                      {!isDone && isFull && (
                        <span className="text-xs text-q-muted">Limit reached</span>
                      )}
                      {Number(task.maxCompletions) > 0 && (
                        <span className="text-xs text-q-muted">
                          {Number(task.completionCount)}/{Number(task.maxCompletions)}
                        </span>
                      )}
                    </div>
                    <p className="text-q-text font-semibold text-sm mb-0.5">{task.title}</p>
                    <p className="text-q-muted text-xs">{task.description}</p>
                    {txMap[id] && (
                      <p className="text-q-green text-xs mt-1.5">
                        ✓ Done!{' '}
                        <a href={`https://testnet.arcscan.app/tx/${txMap[id]}`} target="_blank" rel="noopener noreferrer" className="underline">View tx ↗</a>
                      </p>
                    )}
                    {errMap[id] && <p className="text-q-red text-xs mt-1.5">{errMap[id]}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex items-center gap-1 bg-q-blue/10 border border-q-blue/20 rounded-lg px-2.5 py-1">
                      <Zap size={11} className="text-q-blue fill-q-blue" />
                      <span className="text-q-blue font-mono font-semibold text-xs">+{pts}</span>
                    </div>
                    {!isDone && !isFull && (
                      <button onClick={() => claim(task.id)} disabled={!!isClaiming} className="btn-primary text-xs py-1.5 px-3">
                        {isClaiming
                          ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          : <><Circle size={11} /> Claim</>}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
          {shown.length === 0 && (
            <div className="text-center py-16 text-q-muted text-sm">No tasks found.</div>
          )}
        </div>
      )}
    </div>
  )
}
