// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CyberChachaGuard
 * @dev An on-chain Cyber Security Operations Center (SOC) "Kill Switch" for AI Agents.
 */
contract CyberChachaGuard {
    address public socAdmin;

    struct Agent {
        bool isActive;
    }

    // Mapping from agent ID (or address) to Agent struct
    mapping(address => Agent) public agents;

    // Events for frontend indexing
    event AgentRevoked(address indexed agentAddress);
    event AgentRestored(address indexed agentAddress);

    // Modifier to check if the caller is the SOC Admin
    modifier onlyAdmin() {
        require(msg.sender == socAdmin, "CyberChachaGuard: Not the SOC Admin");
        _;
    }

    constructor() {
        // The deployer is the SOC Admin by default
        socAdmin = msg.sender;
    }

    /**
     * @dev Revokes an agent completely (Kill Switch). 
     * @param agentAddress The address identifier for the agent.
     */
    function revokeAgent(address agentAddress) external onlyAdmin {
        // We do not require it to be explicitly "active" first, 
        // to allow pre-emptive revokes of unknown addresses during emergencies.
        agents[agentAddress].isActive = false;
        emit AgentRevoked(agentAddress);
    }

    /**
     * @dev Restores an agent after an investigation confirms it was a false positive.
     * @param agentAddress The address identifier for the agent.
     */
    function restoreAgent(address agentAddress) external onlyAdmin {
        agents[agentAddress].isActive = true;
        emit AgentRestored(agentAddress);
    }
}
