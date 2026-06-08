// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "./PointToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title StakePool — Stake AQP to earn 1% daily rewards
contract StakePool is Ownable {
    PointToken public pointToken;

    uint256 public constant REWARD_RATE_BPS  = 100;
    uint256 public constant SECONDS_PER_DAY  = 86400;

    struct StakeInfo {
        uint256 amount;
        uint256 stakedAt;
        uint256 lastClaim;
    }

    mapping(address => StakeInfo) public stakes;
    uint256 public totalStaked;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount, uint256 rewards);
    event RewardsClaimed(address indexed user, uint256 rewards);

    constructor(address _pointToken) Ownable(msg.sender) {
        pointToken = PointToken(_pointToken);
    }

    function stake(uint256 amount) external {
        require(amount > 0, "Cannot stake 0");
        if (stakes[msg.sender].amount > 0) _claimRewards(msg.sender);
        pointToken.burn(msg.sender, amount);
        stakes[msg.sender].amount += amount;
        stakes[msg.sender].stakedAt = block.timestamp;
        stakes[msg.sender].lastClaim = block.timestamp;
        totalStaked += amount;
        emit Staked(msg.sender, amount);
    }

    function unstake(uint256 amount) external {
        require(stakes[msg.sender].amount >= amount, "Insufficient staked");
        uint256 rewards = _claimRewards(msg.sender);
        stakes[msg.sender].amount -= amount;
        totalStaked -= amount;
        pointToken.mint(msg.sender, amount);
        emit Unstaked(msg.sender, amount, rewards);
    }

    function claimRewards() external {
        require(stakes[msg.sender].amount > 0, "Nothing staked");
        require(pendingRewards(msg.sender) > 0, "No rewards yet");
        _claimRewards(msg.sender);
    }

    function _claimRewards(address user) internal returns (uint256) {
        uint256 pending = pendingRewards(user);
        if (pending > 0) {
            stakes[user].lastClaim = block.timestamp;
            pointToken.mint(user, pending);
            emit RewardsClaimed(user, pending);
        }
        return pending;
    }

    function pendingRewards(address user) public view returns (uint256) {
        StakeInfo memory info = stakes[user];
        if (info.amount == 0) return 0;
        return (info.amount * REWARD_RATE_BPS * (block.timestamp - info.lastClaim)) / (10000 * SECONDS_PER_DAY);
    }

    function getStakeInfo(address user) external view returns (
        uint256 stakedAmount, uint256 stakedAt, uint256 pending
    ) {
        return (stakes[user].amount, stakes[user].stakedAt, pendingRewards(user));
    }
}
