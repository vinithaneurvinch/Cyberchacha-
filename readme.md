# 🛡️ CyberChacha: Autonomous Web3 MSSP

**CyberChacha** is an automated, AI-driven Managed Security Service Provider (MSSP) and Cyber Security Operations Center (SOC) built for modern Web3 companies. **This product is designed to completely automate and replace human SOC Tier 1 and Tier 2 workflows**. 

By acting as an intelligent firewall, it autonomously monitors agent intents, conducts investigations, and instantly executes mitigations via the **Monad** blockchain if malicious behavior is detected.

## 🚀 How We Automate SOC Tiers

Traditional SOCs rely on tiered human analysts. CyberChacha automates the first two tiers using LLMs:

- **Tier 1 (Monitoring & Triage)**: CyberChacha constantly monitors incoming logs. It automatically closes false positives (marking them as "Secured Ops") and performs basic investigation and mitigation without human fatigue.
- **Tier 2 (Deep Investigation & Mitigation)**: For complex or hidden threats (like APTs or data exfiltration), the Sarvam AI performs deep contextual investigations. If a severe threat is confirmed, CyberChacha automatically triggers the `CyberChachaGuard` smart contract to revoke the agent's permissions, handling the mitigation instantly.

## ✨ Key Features

- **Dynamic SOC Dashboard**: A stunning, responsive UI built with Next.js and Tailwind CSS v4, featuring real-time system health widgets and interactive threat monitoring.
- **Enterprise Dark/Light Mode**: Seamlessly toggle between a clean "Security Overview" (Light) and a sleek "Enterprise SOC" (Dark) aesthetic.
- **Threat Feed Simulator**: Built-in interactive terminal to simulate real-world log ingestion (Data Exfiltration, Phishing, Unauthorized Minting).
- **Sarvam AI Integration**: A powerful Next.js API route that leverages Sarvam AI to classify log severity dynamically.
- **Web3 Kill Switch**: Integrated with `wagmi` and `viem` to broadcast the `revokeAgent()` transaction directly to the blockchain upon threat detection.

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React, Tailwind CSS v4
- **Web3**: Wagmi, Viem, injected connectors (MetaMask, etc.)
- **Smart Contracts**: Solidity, Hardhat, Ignition
- **AI/Backend**: Sarvam AI (via Next.js Edge/Serverless API routes)

---

## 💻 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- npm or yarn
- MetaMask (or another Web3 wallet) configured for the Monad testnet/local network.

### 2. Environment Variables
Create a `.env` file in the root directory and add your Sarvam AI key:
```env
SARVAM_API_KEY=your_sarvam_api_key_here
```

### 3. Smart Contract Deployment (Local Testing)
To test the "Kill Switch" locally, you can spin up a Hardhat node:
```bash
# Start a local blockchain node
npx hardhat node

# In a new terminal, deploy the CyberChachaGuard contract
npx hardhat ignition deploy ignition/modules/CyberChachaGuard.ts --network localhost
```
*Note: Update the `CONTRACT_ADDRESS` constant in `app/page.tsx` with the deployed address if you are running locally.*

### 4. Running the Dashboard
Install the necessary dependencies and start the Next.js development server:
```bash
npm install
npm run dev
```
Navigate to `http://localhost:3000` to interact with the CyberChacha SOC.

---

## 🔍 How to Use the Simulator

1. **Connect Wallet**: Click "Connect Wallet" in the top right to authorize yourself as the SOC Admin.
2. **Select a Scenario**: In the **Threat Feed Simulator** panel, click on either the "L2 SCENARIO" or "L1 SCENARIO" to populate the raw log console with realistic attack data.
3. **Execute Deep Scan**: Click the execute button. 
4. **Observe**: 
   - The AI will classify the logs.
   - If malicious, the wallet will prompt you to confirm the `revokeAgent` transaction.
   - Upon confirmation, the agent's status will instantly change to **REVOKED**, the visual pulse will stop, and your Threat widgets will update.

## 🤝 Hackathon Ready
This project is structured for high-impact hackathon presentations, combining an enterprise-grade UI, real-time AI classification, and on-chain state manipulation into a single coherent narrative.
