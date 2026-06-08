// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "forge-std/Script.sol";
import "../src/PointToken.sol";
import "../src/CheckIn.sol";
import "../src/TaskManager.sol";
import "../src/MockSwap.sol";
import "../src/StakePool.sol";
import "../src/BadgeNFT.sol";

contract DeployAll is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(pk);

        PointToken   pt  = new PointToken();
        CheckIn      ci  = new CheckIn(address(pt));
        TaskManager  tm  = new TaskManager(address(pt));
        MockSwap     ms  = new MockSwap(address(pt));
        StakePool    sp  = new StakePool(address(pt));
        BadgeNFT     bn  = new BadgeNFT(address(pt));

        pt.addMinter(address(ci));
        pt.addMinter(address(tm));
        pt.addMinter(address(ms));
        pt.addMinter(address(sp));
        pt.addMinter(address(bn));

        // Sample tasks
        tm.createTask("Follow ARC on Twitter",   "Follow @arc_network and RT pinned post",    25 * 1e18, TaskManager.TaskType.SOCIAL,    0);
        tm.createTask("Join ARC Discord",         "Join and introduce yourself in #general",   30 * 1e18, TaskManager.TaskType.COMMUNITY, 0);
        tm.createTask("First On-chain Tx",        "Send your first tx on Arc Testnet",         50 * 1e18, TaskManager.TaskType.ONCHAIN,   0);
        tm.createTask("Share ARC Quest",          "Post about ARC Quest on social media",      20 * 1e18, TaskManager.TaskType.SOCIAL,    0);
        tm.createTask("Complete Your Profile",    "Fill in profile info in the DApp",          15 * 1e18, TaskManager.TaskType.COMMUNITY, 0);
        tm.createTask("Bridge to Arc Testnet",    "Bridge assets using the Arc bridge",        75 * 1e18, TaskManager.TaskType.ONCHAIN,   0);

        vm.stopBroadcast();

        console.log("NEXT_PUBLIC_POINT_TOKEN_ADDRESS=%s",  address(pt));
        console.log("NEXT_PUBLIC_CHECKIN_ADDRESS=%s",      address(ci));
        console.log("NEXT_PUBLIC_TASK_MANAGER_ADDRESS=%s", address(tm));
        console.log("NEXT_PUBLIC_MOCK_SWAP_ADDRESS=%s",    address(ms));
        console.log("NEXT_PUBLIC_STAKE_POOL_ADDRESS=%s",   address(sp));
        console.log("NEXT_PUBLIC_BADGE_NFT_ADDRESS=%s",    address(bn));
    }
}
