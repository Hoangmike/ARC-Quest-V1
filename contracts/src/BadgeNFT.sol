// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./PointToken.sol";

/// @title BadgeNFT — ERC721 badges redeemable with AQP points
contract BadgeNFT is ERC721, Ownable {
    PointToken public pointToken;

    enum Rarity { COMMON, RARE, EPIC, LEGENDARY }

    struct BadgeType {
        uint256 id;
        string name;
        string description;
        uint256 pointCost;
        Rarity rarity;
        bool active;
        uint256 totalMinted;
        uint256 maxSupply;
    }

    uint256 public nextBadgeTypeId;
    uint256 public nextTokenId;

    mapping(uint256 => BadgeType) public badgeTypes;
    mapping(uint256 => uint256) public tokenToBadgeType;
    mapping(address => mapping(uint256 => bool)) public hasMinted;

    event BadgeTypeCreated(uint256 indexed badgeTypeId, string name, uint256 pointCost);
    event BadgeMinted(address indexed user, uint256 indexed tokenId, uint256 badgeTypeId);

    constructor(address _pointToken) ERC721("ARC Quest Badge", "AQB") Ownable(msg.sender) {
        pointToken = PointToken(_pointToken);
        _seed();
    }

    function _seed() internal {
        _add("Early Adopter",     "First to join the ARC Quest community",        50 * 1e18,   Rarity.COMMON,    0);
        _add("Daily Keeper",      "Maintained a 7-day check-in streak",           100 * 1e18,  Rarity.COMMON,    0);
        _add("Task Hunter",       "Completed 5 community tasks",                  150 * 1e18,  Rarity.COMMON,    0);
        _add("Swap Pioneer",      "Performed first swap on ARC DEX",              300 * 1e18,  Rarity.RARE,      0);
        _add("Staker",            "Staked tokens and earned yield rewards",        300 * 1e18,  Rarity.RARE,      0);
        _add("ARC Veteran",       "Active ARC community member for 30 days",      500 * 1e18,  Rarity.EPIC,    500);
        _add("Point Millionaire", "Accumulated 1000+ points total",               750 * 1e18,  Rarity.EPIC,    200);
        _add("ARC Legend",        "Top contributor to the ARC ecosystem",        1000 * 1e18,  Rarity.LEGENDARY, 50);
    }

    function _add(string memory name, string memory desc, uint256 cost, Rarity rarity, uint256 maxSupply) internal {
        uint256 id = nextBadgeTypeId++;
        badgeTypes[id] = BadgeType(id, name, desc, cost, rarity, true, 0, maxSupply);
        emit BadgeTypeCreated(id, name, cost);
    }

    function createBadgeType(
        string calldata name, string calldata description,
        uint256 pointCost, Rarity rarity, uint256 maxSupply
    ) external onlyOwner { _add(name, description, pointCost, rarity, maxSupply); }

    function mintBadge(uint256 badgeTypeId) external {
        BadgeType storage badge = badgeTypes[badgeTypeId];
        require(badge.active, "Badge not active");
        require(!hasMinted[msg.sender][badgeTypeId], "Already owned");
        require(badge.maxSupply == 0 || badge.totalMinted < badge.maxSupply, "Sold out");
        require(pointToken.balanceOf(msg.sender) >= badge.pointCost, "Insufficient points");

        pointToken.burn(msg.sender, badge.pointCost);
        uint256 tokenId = nextTokenId++;
        hasMinted[msg.sender][badgeTypeId] = true;
        badge.totalMinted += 1;
        tokenToBadgeType[tokenId] = badgeTypeId;
        _safeMint(msg.sender, tokenId);
        emit BadgeMinted(msg.sender, tokenId, badgeTypeId);
    }

    function getAllBadgeTypes() external view returns (BadgeType[] memory) {
        BadgeType[] memory r = new BadgeType[](nextBadgeTypeId);
        for (uint256 i = 0; i < nextBadgeTypeId; i++) r[i] = badgeTypes[i];
        return r;
    }

    function getUserBadges(address user) external view returns (uint256[] memory) {
        uint256 bal = balanceOf(user);
        uint256[] memory tokens = new uint256[](bal);
        uint256 idx;
        for (uint256 i = 0; i < nextTokenId; i++) {
            if (_ownerOf(i) == user) tokens[idx++] = i;
        }
        return tokens;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return string(abi.encodePacked("https://arc-quest.vercel.app/api/badge/", _str(tokenId)));
    }

    function _str(uint256 v) internal pure returns (string memory) {
        if (v == 0) return "0";
        uint256 t = v; uint256 d;
        while (t != 0) { d++; t /= 10; }
        bytes memory b = new bytes(d);
        while (v != 0) { d--; b[d] = bytes1(uint8(48 + v % 10)); v /= 10; }
        return string(b);
    }
}
