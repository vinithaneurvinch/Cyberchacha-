// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CyberChachaGuard
 * @dev An on-chain Cyber Security Operations Center (SOC) "Kill Switch" for AI Agents.
 */
contract CyberChachaGuard {
    struct Agent {
        address owner;
        bool isActive;
    }

    // Mapping from agent ID (or address) to Agent struct
    mapping(address => Agent) public agents;

    // Events for frontend indexing
    event AgentRegistered(address indexed agentAddress, address indexed owner);
    event AgentPaused(address indexed agentAddress);
    event AgentRevoked(address indexed agentAddress);

    // Modifier to check if the caller is the owner of the agent
    modifier onlyAgentOwner(address agentAddress) {
        require(agents[agentAddress].owner == msg.sender, "CyberChachaGuard: Not the agent owner");
        _;
    }

    /**
     * @dev Registers a new agent. The agent is active by default.
     * @param agentAddress The address identifier for the agent.
     */
    function registerAgent(address agentAddress) external {
        require(agents[agentAddress].owner == address(0), "CyberChachaGuard: Agent already registered");
        
        agents[agentAddress] = Agent({
            owner: msg.sender,
            isActive: true
        });

        emit AgentRegistered(agentAddress, msg.sender);
    }

    /**
     * @dev Pauses an agent temporarily.
     * @param agentAddress The address identifier for the agent.
     */
    function pauseAgent(address agentAddress) external onlyAgentOwner(agentAddress) {
        require(agents[agentAddress].isActive, "CyberChachaGuard: Agent is already paused or revoked");
        
        agents[agentAddress].isActive = false;
        
        emit AgentPaused(agentAddress);
    }

    /**
     * @dev Revokes an agent completely (Kill Switch). 
     * This acts identically to pause in this MVP, but signifies a permanent security lockdown.
     * @param agentAddress The address identifier for the agent.
     */
    function revokeAgent(address agentAddress) external onlyAgentOwner(agentAddress) {
        require(agents[agentAddress].isActive, "CyberChachaGuard: Agent is already revoked");
        
        agents[agentAddress].isActive = false;
        
        emit AgentRevoked(agentAddress);
    }
}
