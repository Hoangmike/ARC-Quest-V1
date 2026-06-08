export const ARC_TESTNET = {
  chainId:        '0x4CDB52',
  chainIdDecimal: 5042002,
  chainName:      'Arc Testnet',
  rpcUrls:        ['https://rpc.testnet.arc.network'],
  nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
  blockExplorerUrls: ['https://testnet.arcscan.app'],
}

export const ADDR = {
  POINT_TOKEN:  process.env.NEXT_PUBLIC_POINT_TOKEN_ADDRESS  || '0x0000000000000000000000000000000000000001',
  CHECKIN:      process.env.NEXT_PUBLIC_CHECKIN_ADDRESS      || '0x0000000000000000000000000000000000000002',
  TASK_MANAGER: process.env.NEXT_PUBLIC_TASK_MANAGER_ADDRESS || '0x0000000000000000000000000000000000000003',
  MOCK_SWAP:    process.env.NEXT_PUBLIC_MOCK_SWAP_ADDRESS    || '0x0000000000000000000000000000000000000004',
  STAKE_POOL:   process.env.NEXT_PUBLIC_STAKE_POOL_ADDRESS   || '0x0000000000000000000000000000000000000005',
  BADGE_NFT:    process.env.NEXT_PUBLIC_BADGE_NFT_ADDRESS    || '0x0000000000000000000000000000000000000006',
}

export const POINT_TOKEN_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function approve(address,uint256) returns (bool)',
  'function allowance(address,address) view returns (uint256)',
  'function transfer(address,uint256) returns (bool)',
]

export const CHECKIN_ABI = [
  'function checkIn() external',
  'function getUserData(address) view returns (uint256,uint256,uint256,bool)',
  'function getTimeUntilNextCheckIn(address) view returns (uint256)',
]

export const TASK_MANAGER_ABI = [
  'function getActiveTasks() view returns (tuple(uint256 id,string title,string description,uint256 pointReward,uint8 taskType,bool active,uint256 completionCount,uint256 maxCompletions)[])',
  'function completeTask(uint256) external',
  'function hasCompleted(address,uint256) view returns (bool)',
  'function totalTasksCompleted(address) view returns (uint256)',
]

export const MOCK_SWAP_ABI = [
  'function swap() external payable',
  'function pointsPerUsdc() view returns (uint256)',
  'function getUserStats(address) view returns (uint256,uint256)',
]

export const STAKE_POOL_ABI = [
  'function stake(uint256) external',
  'function unstake(uint256) external',
  'function claimRewards() external',
  'function pendingRewards(address) view returns (uint256)',
  'function getStakeInfo(address) view returns (uint256,uint256,uint256)',
  'function totalStaked() view returns (uint256)',
]

export const BADGE_NFT_ABI = [
  'function getAllBadgeTypes() view returns (tuple(uint256 id,string name,string description,uint256 pointCost,uint8 rarity,bool active,uint256 totalMinted,uint256 maxSupply)[])',
  'function mintBadge(uint256) external',
  'function hasMinted(address,uint256) view returns (bool)',
  'function balanceOf(address) view returns (uint256)',
]
