// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "./PointToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title CheckIn — Daily check-in with streak bonuses
contract CheckIn is Ownable {
    PointToken public pointToken;

    uint256 public constant BASE_POINTS    = 10 * 1e18;
    uint256 public constant STREAK_BONUS   = 5  * 1e18;
    uint256 public constant MAX_STREAK_BONUS = 50 * 1e18;
    uint256 public constant CHECKIN_INTERVAL = 24 hours;
    uint256 public constant STREAK_WINDOW   = 48 hours;

    struct UserData {
        uint256 lastCheckIn;
        uint256 streak;
        uint256 totalCheckIns;
    }

    mapping(address => UserData) public userData;

    event CheckedIn(address indexed user, uint256 streak, uint256 pointsEarned, uint256 timestamp);

    constructor(address _pointToken) Ownable(msg.sender) {
        pointToken = PointToken(_pointToken);
    }

    function checkIn() external {
        UserData storage d = userData[msg.sender];
        uint256 t = block.timestamp;
        require(t >= d.lastCheckIn + CHECKIN_INTERVAL, "Already checked in today");

        if (d.lastCheckIn == 0 || t > d.lastCheckIn + STREAK_WINDOW) {
            d.streak = 1;
        } else {
            d.streak += 1;
        }

        uint256 bonus = (d.streak - 1) * STREAK_BONUS;
        if (bonus > MAX_STREAK_BONUS) bonus = MAX_STREAK_BONUS;
        uint256 points = BASE_POINTS + bonus;

        d.lastCheckIn = t;
        d.totalCheckIns += 1;
        pointToken.mint(msg.sender, points);
        emit CheckedIn(msg.sender, d.streak, points, t);
    }

    function getUserData(address user) external view returns (
        uint256 lastCheckIn, uint256 streak, uint256 totalCheckIns, bool canCheckInNow
    ) {
        UserData memory d = userData[user];
        return (d.lastCheckIn, d.streak, d.totalCheckIns,
            block.timestamp >= d.lastCheckIn + CHECKIN_INTERVAL);
    }

    function getTimeUntilNextCheckIn(address user) external view returns (uint256) {
        uint256 next = userData[user].lastCheckIn + CHECKIN_INTERVAL;
        return block.timestamp >= next ? 0 : next - block.timestamp;
    }
}
