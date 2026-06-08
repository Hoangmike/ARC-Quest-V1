// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "./PointToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title TaskManager — Community task rewards
contract TaskManager is Ownable {
    PointToken public pointToken;

    enum TaskType { SOCIAL, ONCHAIN, COMMUNITY, SPECIAL }

    struct Task {
        uint256 id;
        string title;
        string description;
        uint256 pointReward;
        TaskType taskType;
        bool active;
        uint256 completionCount;
        uint256 maxCompletions;
    }

    uint256 public nextTaskId;
    mapping(uint256 => Task) public tasks;
    mapping(address => mapping(uint256 => bool)) public hasCompleted;
    mapping(address => uint256) public totalTasksCompleted;

    event TaskCreated(uint256 indexed taskId, string title, uint256 pointReward);
    event TaskCompleted(address indexed user, uint256 indexed taskId, uint256 pointsEarned);

    constructor(address _pointToken) Ownable(msg.sender) {
        pointToken = PointToken(_pointToken);
    }

    function createTask(
        string calldata title, string calldata description,
        uint256 pointReward, TaskType taskType, uint256 maxCompletions
    ) external onlyOwner returns (uint256) {
        uint256 id = nextTaskId++;
        tasks[id] = Task(id, title, description, pointReward, taskType, true, 0, maxCompletions);
        emit TaskCreated(id, title, pointReward);
        return id;
    }

    function completeTask(uint256 taskId) external {
        Task storage task = tasks[taskId];
        require(task.active, "Task not active");
        require(!hasCompleted[msg.sender][taskId], "Already completed");
        require(task.maxCompletions == 0 || task.completionCount < task.maxCompletions, "Task fully claimed");

        hasCompleted[msg.sender][taskId] = true;
        task.completionCount += 1;
        totalTasksCompleted[msg.sender] += 1;
        pointToken.mint(msg.sender, task.pointReward);
        emit TaskCompleted(msg.sender, taskId, task.pointReward);
    }

    function getActiveTasks() external view returns (Task[] memory) {
        uint256 count;
        for (uint256 i = 0; i < nextTaskId; i++) if (tasks[i].active) count++;
        Task[] memory result = new Task[](count);
        uint256 idx;
        for (uint256 i = 0; i < nextTaskId; i++) if (tasks[i].active) result[idx++] = tasks[i];
        return result;
    }

    function setTaskActive(uint256 taskId, bool active) external onlyOwner {
        tasks[taskId].active = active;
    }
}
