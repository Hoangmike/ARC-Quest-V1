# ARC Quest 🎮

> Earn points, collect badges, conquer the Arc Network testnet.

A full-stack Web3 DApp on Arc Testnet featuring daily check-ins, community tasks, swap, stake, and NFT badges — deployed to Vercel.

---

## ✨ Features

| Feature | Description | Reward |
|---------|-------------|--------|
| ✅ Daily Check-In | Check in every 24h with streak bonuses | 10–60 pts/day |
| 📋 Community Tasks | Social, on-chain, community one-time tasks | 15–75 pts/task |
| 🔄 Swap | Swap USDC (Arc native) for points | 100 pts/USDC |
| 🏦 Stake | Stake AQP tokens for daily yield | 1%/day (365% APR) |
| 🏆 NFT Badges | Redeem points for ERC721 badges | 4 rarity tiers |

---

## 🏗️ Architecture

```
arc-quest/
├── contracts/          # Solidity (Foundry)
│   ├── src/
│   │   ├── PointToken.sol     # ERC20 — AQP points
│   │   ├── CheckIn.sol        # Daily check-in + streak bonus
│   │   ├── TaskManager.sol    # Community tasks
│   │   ├── MockSwap.sol       # USDC → Points swap
│   │   ├── StakePool.sol      # Stake AQP, earn yield
│   │   └── BadgeNFT.sol       # ERC721 NFT badges
│   └── script/
│       └── DeployAll.s.sol    # One-shot deploy script
│
├── frontend/           # Next.js 14 + TypeScript + Tailwind
│   ├── app/
│   │   ├── page.tsx           # Home / hero dashboard
│   │   ├── checkin/page.tsx   # Daily check-in + calendar
│   │   ├── tasks/page.tsx     # Community tasks
│   │   ├── swap/page.tsx      # Swap UI
│   │   ├── stake/page.tsx     # Stake/unstake + live rewards
│   │   ├── badges/page.tsx    # Badge gallery + mint
│   │   └── profile/page.tsx   # User stats + achievements
│   ├── components/
│   │   └── Navbar.tsx
│   └── lib/
│       ├── contracts.ts       # ABIs + addresses
│       └── web3.tsx           # Web3 context (MetaMask)
│
└── vercel.json         # Vercel deployment config
```

---

## 🚀 Quick Start

### 1. Arc Testnet Setup

Add Arc Testnet to MetaMask:

| Field | Value |
|-------|-------|
| Network Name | Arc Testnet |
| RPC URL | `https://rpc.testnet.arc.network` |
| Chain ID | `5042002` |
| Currency | USDC |
| Explorer | `https://testnet.arcscan.app` |

Get testnet USDC: [faucet.circle.com](https://faucet.circle.com)

---

### 2. Deploy Smart Contracts

```bash
cd contracts

# Install Foundry (if not installed)
curl -L https://foundry.paradigm.xyz | bash && foundryup

# Install OpenZeppelin
forge install OpenZeppelin/openzeppelin-contracts

# Copy and fill env
cp .env.example .env
# Edit .env: add your PRIVATE_KEY and ARC_TESTNET_RPC_URL

# Deploy all contracts
forge script script/DeployAll.s.sol \
  --rpc-url $ARC_TESTNET_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  -vvvv
```

Copy the printed addresses into `frontend/.env.local`.

---

### 3. Run Frontend Locally

```bash
cd frontend

npm install

# Copy and fill env
cp .env.local.example .env.local
# Edit .env.local: paste contract addresses from deployment

npm run dev
# → http://localhost:3000
```

---

### 4. Deploy to Vercel

```bash
# From project root
vercel

# Set environment variables in Vercel dashboard:
# NEXT_PUBLIC_POINT_TOKEN_ADDRESS
# NEXT_PUBLIC_CHECKIN_ADDRESS
# NEXT_PUBLIC_TASK_MANAGER_ADDRESS
# NEXT_PUBLIC_MOCK_SWAP_ADDRESS
# NEXT_PUBLIC_STAKE_POOL_ADDRESS
# NEXT_PUBLIC_BADGE_NFT_ADDRESS
```

Or connect GitHub repo → Vercel auto-deploy on push.

---

## 📄 Smart Contract Overview

### PointToken (ERC20)
- Symbol: `AQP`
- Minters: CheckIn, TaskManager, MockSwap, StakePool, BadgeNFT
- Only authorized contracts can mint/burn

### CheckIn
- 24h cooldown per wallet
- Streak window: 48h (miss = reset streak)
- Base: 10 pts | Max bonus: +50 pts (at 10+ day streak)

### TaskManager
- Admin creates tasks with type, reward, optional max completions
- Each task completable once per wallet
- Seeded with 6 default tasks on deploy

### MockSwap
- Send USDC as `msg.value`
- Rate: 100 AQP per 1 USDC (configurable by owner)
- Points minted instantly

### StakePool
- ERC20 approve → stake (tokens burned from wallet)
- 1% daily = 365% APR
- Claim anytime; unstake returns tokens + auto-claims rewards

### BadgeNFT (ERC721)
- 8 default badge types (Common × 3, Rare × 2, Epic × 2, Legendary × 1)
- Limited supply on Epic & Legendary
- Points burned on mint; one badge type per wallet

---

## 🔧 Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Web3**: ethers.js v6, MetaMask
- **Contracts**: Solidity 0.8.30, Foundry, OpenZeppelin
- **Fonts**: Orbitron (display), Inter (body), JetBrains Mono
- **Deploy**: Vercel (frontend) + Arc Testnet (contracts)

---

## 📝 Environment Variables

### `frontend/.env.local`
```
NEXT_PUBLIC_POINT_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_CHECKIN_ADDRESS=0x...
NEXT_PUBLIC_TASK_MANAGER_ADDRESS=0x...
NEXT_PUBLIC_MOCK_SWAP_ADDRESS=0x...
NEXT_PUBLIC_STAKE_POOL_ADDRESS=0x...
NEXT_PUBLIC_BADGE_NFT_ADDRESS=0x...
```

### `contracts/.env`
```
ARC_TESTNET_RPC_URL=https://rpc.testnet.arc.network
PRIVATE_KEY=0x...
ETHERSCAN_API_KEY=...
```
