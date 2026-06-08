// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "./PointToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title MockSwap — Swap USDC native token for AQP points
contract MockSwap is Ownable {
    PointToken public pointToken;
    uint256 public pointsPerUsdc = 100;
    uint256 public totalVolumeSwapped;

    mapping(address => uint256) public userVolume;
    mapping(address => uint256) public userSwapCount;

    event Swapped(address indexed user, uint256 usdcAmount, uint256 pointsEarned);

    constructor(address _pointToken) Ownable(msg.sender) {
        pointToken = PointToken(_pointToken);
    }

    function swap() external payable {
        require(msg.value > 0, "Must send USDC");
        uint256 points = (msg.value * pointsPerUsdc) / 1e18;
        require(points > 0, "Amount too small");

        userVolume[msg.sender] += msg.value;
        userSwapCount[msg.sender] += 1;
        totalVolumeSwapped += msg.value;
        pointToken.mint(msg.sender, points * 1e18);
        emit Swapped(msg.sender, msg.value, points * 1e18);
    }

    function setPointsPerUsdc(uint256 rate) external onlyOwner { pointsPerUsdc = rate; }
    function withdraw() external onlyOwner { payable(owner()).transfer(address(this).balance); }

    function getUserStats(address user) external view returns (uint256 volume, uint256 swapCount) {
        return (userVolume[user], userSwapCount[user]);
    }
}
