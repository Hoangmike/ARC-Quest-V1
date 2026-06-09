'use client'
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import { ARC_TESTNET, ADDR, POINT_TOKEN_ABI } from './contracts'

interface Ctx {
  provider: ethers.BrowserProvider | null
  signer:   ethers.JsonRpcSigner | null
  address:  string | null
  chainId:  number | null
  balance:  string
  isConnected:      boolean
  isCorrectNetwork: boolean
  isConnecting:     boolean
  connect:    () => Promise<void>
  disconnect: () => void
  switchNet:  () => Promise<void>
  refresh:    () => Promise<void>
}

const Web3Ctx = createContext<Ctx>({
  provider: null, signer: null, address: null, chainId: null, balance: '0',
  isConnected: false, isCorrectNetwork: false, isConnecting: false,
  connect: async () => {}, disconnect: () => {}, switchNet: async () => {}, refresh: async () => {},
})

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer,   setSigner]   = useState<ethers.JsonRpcSigner | null>(null)
  const [address,  setAddress]  = useState<string | null>(null)
  const [chainId,  setChainId]  = useState<number | null>(null)
  const [balance,  setBalance]  = useState('0')
  const [isConnecting, setIsConnecting] = useState(false)

  const isConnected      = !!address
  const isCorrectNetwork = chainId === ARC_TESTNET.chainIdDecimal

  const refresh = useCallback(async () => {
  if (!provider || !address) return
  try {
    // Dùng getBalance thay vì balanceOf vì USDC là native token trên Arc
    const bal = await provider.getBalance(address)
    setBalance(ethers.formatEther(bal))
  } catch { setBalance('0') }
  }, [provider, address])

  const connect = useCallback(async () => {
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      alert('Please install MetaMask!')
      return
    }
    setIsConnecting(true)
    try {
      const p = new ethers.BrowserProvider((window as any).ethereum)
      await p.send('eth_requestAccounts', [])
      const s = await p.getSigner()
      const a = await s.getAddress()
      const n = await p.getNetwork()
      setProvider(p); setSigner(s); setAddress(a); setChainId(Number(n.chainId))
    } catch (e) { console.error(e) }
    finally { setIsConnecting(false) }
  }, [])

  const disconnect = useCallback(() => {
    setProvider(null); setSigner(null); setAddress(null); setChainId(null); setBalance('0')
  }, [])

  const switchNet = useCallback(async () => {
    const eth = (window as any).ethereum
    if (!eth) return
    try {
      await eth.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: ARC_TESTNET.chainId }] })
    } catch (e: any) {
      if (e.code === 4902) {
        await eth.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: ARC_TESTNET.chainId, chainName: ARC_TESTNET.chainName,
            rpcUrls: ARC_TESTNET.rpcUrls, nativeCurrency: ARC_TESTNET.nativeCurrency,
            blockExplorerUrls: ARC_TESTNET.blockExplorerUrls,
          }],
        })
      }
    }
  }, [])

  useEffect(() => {
    const eth = (window as any).ethereum
    if (!eth) return
    const onAccounts = (a: string[]) => { if (!a.length) disconnect(); else setAddress(a[0]) }
    const onChain    = (c: string)   => { setChainId(parseInt(c, 16)) }
    eth.on('accountsChanged', onAccounts)
    eth.on('chainChanged', onChain)
    return () => { eth.removeListener('accountsChanged', onAccounts); eth.removeListener('chainChanged', onChain) }
  }, [disconnect])

  useEffect(() => { if (isConnected && isCorrectNetwork) refresh() }, [isConnected, isCorrectNetwork, refresh])

  return (
    <Web3Ctx.Provider value={{ provider, signer, address, chainId, balance, isConnected, isCorrectNetwork, isConnecting, connect, disconnect, switchNet, refresh }}>
      {children}
    </Web3Ctx.Provider>
  )
}

export const useWeb3 = () => useContext(Web3Ctx)
