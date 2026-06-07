"use client";

import { useState, useEffect } from 'react';
import AgentCard from './components/AgentCard';
import { useAccount, useConnect, useDisconnect, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { scenarios } from './data/scenarios';
import { useTheme } from 'next-themes';
import { Moon, Sun, FileText, Activity } from 'lucide-react';

const CONTRACT_ADDRESS = '0xD204d2c89b47F2f72e5E59fa2E65551706b875Aa';
const ABI = [
  {
    "inputs": [{ "internalType": "address", "name": "agentAddress", "type": "address" }],
    "name": "revokeAgent",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "agentAddress", "type": "address" }],
    "name": "restoreAgent",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

export default function Home() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { writeContract, data: hash } = useWriteContract();
  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });
  
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [agents, setAgents] = useState([
    { id: 1, address: '0x1234567890abcdef1234567890abcdef12345678', isActive: true, clearance: 'DeFi Trader Bot' },
    { id: 2, address: '0x9876543210fedcba9876543210fedcba98765432', isActive: true, clearance: 'NFT Curator Bot' },
    { id: 3, address: '0xabcdef1234567890abcdef1234567890abcdef12', isActive: true, clearance: 'Treasury Manager' },
  ]);
  
  const [task, setTask] = useState('');
  const [status, setStatus] = useState('Idle');
  const [threatData, setThreatData] = useState<{severity: string, threatType: string, reason?: string} | null>(null);

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [reportModal, setReportModal] = useState<any>(null);
  
  // Recent Activity Log
  const [scanHistory, setScanHistory] = useState<{id: number, time: string, payload: string, severity: string, action: string}[]>([]);

  // Live log streaming
  const [liveLogs, setLiveLogs] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState(true);
  const [isAutoPilot, setIsAutoPilot] = useState(false);

  useEffect(() => {
    if (!isStreaming) return;
    const interval = setInterval(() => {
      const benignLogs = [
        "[INFO] Agent #2: Swap executed successfully on Uniswap V3",
        "[INFO] Agent #1: Monitoring ETH/USDC pool liquidity",
        "[DEBUG] Agent #3: Voting power verified for DAO proposal #42",
        "[INFO] System: Routine smart contract health check passed",
        "[WARN] Agent #2: Gas price spike detected, delaying transaction",
        "[INFO] Agent #1: Yield farming rewards harvested",
      ];
      const log = `${new Date().toLocaleTimeString()} - ${benignLogs[Math.floor(Math.random() * benignLogs.length)]}`;
      setLiveLogs(prev => [...prev.slice(-4), log]);
    }, 2500);
    return () => clearInterval(interval);
  }, [isStreaming]);

  // Autonomous AutoPilot Loop
  useEffect(() => {
    if (!isAutoPilot || status.includes('Scanning') || !agents[0].isActive || !isConnected) return;
    
    const interval = setInterval(async () => {
      // 85% chance benign, 15% chance attack
      const isAttack = Math.random() < 0.15;
      let payloadToScan = "";
      
      if (isAttack) {
        payloadToScan = scenarios[Math.floor(Math.random() * scenarios.length)].data;
      } else {
        const benignLogs = [
          "Agent #2 attempting to swap 50 USDC for ETH on Uniswap V3 due to normal arbitrage protocol.",
          "Agent #1 monitoring ETH/USDC pool liquidity.",
          "Agent #3 checking voting power for DAO proposal #42.",
          "System: Routine smart contract health check passed.",
          "Agent #2: Gas price spike detected, delaying transaction.",
        ];
        payloadToScan = benignLogs[Math.floor(Math.random() * benignLogs.length)];
      }

      setTask(payloadToScan);
      setIsStreaming(false);
      setStatus('Scanning intent via AI...');
      setThreatData(null);

      try {
        const res = await fetch('/api/scan-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: payloadToScan })
        });
        const data = await res.json();
        
        setThreatData({ severity: data.severity, threatType: data.threatType, reason: data.reason });

        const newRecord = {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          payload: payloadToScan.substring(0, 60) + (payloadToScan.length > 60 ? '...' : ''),
          severity: data.isMalicious ? data.severity : 'SAFE',
          action: data.isMalicious ? 'Kill Switch Triggered' : 'Forwarded to Mainnet'
        };

        if (data.isMalicious) {
          setStatus(`Malicious Intent Detected. Revoking Agent #1 on Monad...`);
          if (data.severity === 'L2') setMetrics(prev => ({ ...prev, l2Threats: prev.l2Threats + 1, pendingIntrusions: prev.pendingIntrusions + 1 }));
          if (data.severity === 'L1') setMetrics(prev => ({ ...prev, l1Threats: prev.l1Threats + 1, pendingIntrusions: prev.pendingIntrusions + 1 }));
          
          setIsAutoPilot(false); // Halt autopilot on threat!
          
          writeContract({
            address: CONTRACT_ADDRESS,
            abi: ABI,
            functionName: 'revokeAgent',
            args: [agents[0].address],
          });
        } else {
          setStatus('Intent clear. Task forwarded.');
          if (data.severity === 'Moderate') {
             setMetrics(prev => ({ ...prev, moderateThreats: prev.moderateThreats + 1, securedOps: prev.securedOps + 1 }));
          } else {
             setMetrics(prev => ({ ...prev, lowThreats: prev.lowThreats + 1, securedOps: prev.securedOps + 1 }));
          }
          setIsStreaming(true);
        }
        
        setScanHistory(prev => [newRecord, ...prev]);

      } catch (e) {
        setStatus('Error scanning intent.');
        setIsAutoPilot(false);
      }

    }, 5000); // Runs every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPilot, status, agents, isConnected, writeContract]);

  // Stats for the widgets
  const [metrics, setMetrics] = useState({
    totalAgents: 3,
    pendingIntrusions: 0,
    securedOps: 12,
    criticalAlerts: 0,
    l1Threats: 0,
    l2Threats: 0,
    moderateThreats: 0,
    lowThreats: 0
  });

  if (isConfirmed && status.includes('Revoking Agent on Monad')) {
    setAgents(agents.map(a => a.id === 1 ? { ...a, isActive: false } : a));
    setStatus('Agent Permissions Revoked On-Chain. Lockdown Complete.');
    setMetrics(prev => ({ ...prev, criticalAlerts: prev.criticalAlerts + 1 }));
  }

  if (isConfirmed && status.includes('Restoring Agent on Monad')) {
    setAgents(agents.map(a => a.id === 1 ? { ...a, isActive: true } : a));
    setStatus('Agent Re-Activated. Restored to normal operations.');
  }

  const handleRestore = () => {
    if (!isConnected) return;
    setStatus('Restoring Agent on Monad...');
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      functionName: 'restoreAgent',
      args: [agents[0].address],
    });
    setReportModal(false);
  };

  const handleScenario = (scenarioData: string) => {
    setIsStreaming(false); // Stop the benign feed when user injects an attack
    setTask(scenarioData);
    setThreatData(null);
    setStatus('Idle');
  };

  const handleScan = async () => {
    if (!task.trim()) return;
    if (!isConnected) {
      setStatus('Please connect your wallet first to authorize the Kill Switch.');
      return;
    }

    setIsStreaming(false);
    setStatus('Scanning intent via AI...');
    setThreatData(null);
    try {
      const res = await fetch('/api/scan-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: task })
      });
      const data = await res.json();
      
      setThreatData({ severity: data.severity, threatType: data.threatType, reason: data.reason });

      const newRecord = {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        payload: task.substring(0, 60) + (task.length > 60 ? '...' : ''),
        severity: data.isMalicious ? data.severity : 'SAFE',
        action: data.isMalicious ? 'Kill Switch Triggered' : 'Forwarded to Mainnet'
      };

      if (data.isMalicious) {
        setStatus(`Malicious Intent Detected. Revoking Agent #1 on Monad...`);
        if (data.severity === 'L2') setMetrics(prev => ({ ...prev, l2Threats: prev.l2Threats + 1, pendingIntrusions: prev.pendingIntrusions + 1 }));
        if (data.severity === 'L1') setMetrics(prev => ({ ...prev, l1Threats: prev.l1Threats + 1, pendingIntrusions: prev.pendingIntrusions + 1 }));
        
        writeContract({
          address: CONTRACT_ADDRESS,
          abi: ABI,
          functionName: 'revokeAgent',
          args: [agents[0].address],
        });
      } else {
        setStatus('Intent clear. Task forwarded.');
        if (data.severity === 'Moderate') {
           setMetrics(prev => ({ ...prev, moderateThreats: prev.moderateThreats + 1, securedOps: prev.securedOps + 1 }));
        } else {
           setMetrics(prev => ({ ...prev, lowThreats: prev.lowThreats + 1, securedOps: prev.securedOps + 1 }));
        }
        setIsStreaming(true); // Resume benign feed if clear
      }
      
      setScanHistory(prev => [newRecord, ...prev]);

    } catch (e) {
      setStatus('Error scanning intent.');
    }
  };

  return (
    <div className={`min-h-screen relative overflow-hidden transition-all duration-700 ${!agents[0].isActive ? 'bg-red-50/50 dark:bg-red-950/20 shadow-[inset_0_0_150px_rgba(239,68,68,0.15)] animate-pulse' : ''}`}>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Cyber Grid */}
        <div className="absolute inset-0 bg-grid-pattern animate-grid opacity-50"></div>
        {/* Glowing Orbs */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-400 dark:bg-blue-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-30 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-400 dark:bg-indigo-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-400 dark:bg-purple-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <main className="relative z-10 p-8 lg:p-12 max-w-[1400px] mx-auto font-sans selection:bg-blue-500/30 text-slate-800 dark:text-zinc-100">
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-xl shadow-xl max-w-sm w-full mx-4 transform transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center text-red-600 dark:text-red-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </div>
              <h3 className="text-lg font-bold tracking-tight">Disconnect Wallet</h3>
            </div>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mb-6">
              Are you sure you want to disconnect? You will need to reconnect your wallet to authorize the Monad Kill Switch for future threats.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-zinc-300 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  disconnect();
                  setShowLogoutModal(false);
                }}
                className="px-4 py-2 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors shadow-sm"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Incident Forensics Modal */}
      {reportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-8 rounded-xl shadow-xl max-w-2xl w-full mx-4 transform transition-all max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-zinc-800">
              <div>
                <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Tier 3 Incident Forensics Report</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-mono mt-1">ID: INC-{Math.floor(Math.random() * 100000)} | {new Date().toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20">
                <FileText className="w-6 h-6" />
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-wider mb-2">Affected Entity</h4>
                <div className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 p-4 rounded-lg">
                  <p className="font-semibold text-slate-900 dark:text-white">Agent #1 (DeFi Trader Bot)</p>
                  <p className="text-xs font-mono text-slate-500 dark:text-zinc-400 mt-1">0x1234567890abcdef1234567890abcdef12345678</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-wider mb-2">Threat Classification</h4>
                <div className="flex gap-4">
                  <span className="px-3 py-1.5 rounded-md bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-200 dark:border-red-500/20 font-bold text-sm">
                    {threatData?.severity}
                  </span>
                  <span className="px-3 py-1.5 rounded-md bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 font-bold text-sm">
                    {threatData?.threatType}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-wider mb-2">AI Analysis & Reasoning</h4>
                <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/50 p-4 rounded-lg text-sm text-orange-800 dark:text-orange-200 leading-relaxed">
                  {threatData?.reason}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-wider mb-2">Raw Execution Payload</h4>
                <div className="bg-slate-900 dark:bg-[#000000] p-4 rounded-lg border border-slate-800 dark:border-zinc-800 font-mono text-green-400 dark:text-green-500 text-xs whitespace-pre-wrap overflow-x-auto">
                  {task}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-200 dark:border-zinc-800 flex justify-between items-center">
              <button 
                onClick={handleRestore}
                className="px-4 py-2 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-lg transition-colors border border-slate-200 dark:border-zinc-700 shadow-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                Re-Activate Agent
              </button>
              <button 
                onClick={() => setReportModal(false)}
                className="px-6 py-2 text-sm font-bold text-white bg-slate-800 hover:bg-slate-900 dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 rounded-lg transition-colors shadow-sm"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-end mb-10 pb-6 border-b border-slate-200 dark:border-zinc-800 relative z-10">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="CyberChacha Logo" className="w-16 h-16 rounded-full border-2 border-slate-200 dark:border-zinc-700 shadow-lg object-cover" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">CyberChacha Autonomous SOC</h1>
            <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">AI-Driven Web3 Threat Mitigation Pipeline</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-zinc-400">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            Last synced: {mounted ? new Date().toLocaleDateString() : 'Syncing...'}
          </span>
          
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-md bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:bg-zinc-800 dark:text-zinc-400 transition-colors"
          >
            {mounted ? (theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />) : <div className="w-4 h-4" />}
          </button>

          {isConnected ? (
            <button 
              onClick={() => setShowLogoutModal(true)}
              className="px-3 py-1.5 bg-white dark:bg-zinc-900 rounded-md border border-slate-200 dark:border-zinc-800 text-blue-600 dark:text-blue-400 font-mono hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-200 dark:hover:border-red-900 hover:text-red-500 dark:hover:text-red-400 transition-colors group relative"
            >
              <span className="group-hover:hidden">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
              <span className="hidden group-hover:inline">Disconnect</span>
            </button>
          ) : (
            <button 
              onClick={() => connect({ connector: injected() })}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 rounded-md transition-colors shadow-sm font-semibold"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>

      {/* Top Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Agents', sub: 'Active end nodes', value: metrics.totalAgents, iconBg: 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20', icon: 'M12 4v16m8-8H4' },
          { label: 'Threats Blocked', sub: 'Malicious intent', value: metrics.pendingIntrusions, iconBg: 'bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
          { label: 'False Positives Closed', sub: 'Verified by AI', value: metrics.securedOps, iconBg: 'bg-green-50 text-green-600 border-green-100 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
          { label: 'Tier 2 Escalations', sub: 'Deep investigations', value: metrics.criticalAlerts, iconBg: 'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20', icon: 'M13 10V3L4 14h7v7l9-11h-7z' }
        ].map((card, i) => (
          <div key={i} className="bg-white border-slate-200 dark:bg-zinc-900 border dark:border-zinc-800 rounded-xl p-5 flex flex-col justify-between h-36 relative overflow-hidden transition-colors shadow-sm dark:shadow-none hover:border-slate-300 dark:hover:border-zinc-700">
            <div className={`w-8 h-8 rounded-lg border flex items-center justify-center mb-3 ${card.iconBg}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
              </svg>
            </div>
            <div>
              <div className="text-3xl font-bold tracking-tight">{card.value}</div>
              <div className="text-xs font-semibold text-slate-500 dark:text-zinc-400 mt-1 uppercase tracking-wider">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Middle Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        
        {/* System Health */}
        <div className="bg-white border border-slate-200 dark:bg-zinc-900 dark:border-zinc-800 rounded-xl p-6 shadow-sm dark:shadow-none">
          <div className="flex items-center gap-2 mb-6 text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            System Health
          </div>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-slate-50 border border-slate-100 dark:bg-zinc-950/50 dark:border-zinc-800/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-500 dark:text-green-400 mb-1">{agents.filter(a => a.isActive).length}</div>
              <div className="text-xs font-medium text-slate-600 dark:text-zinc-500">Healthy Agents</div>
            </div>
            <div className="bg-slate-50 border border-slate-100 dark:bg-zinc-950/50 dark:border-zinc-800/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-500 dark:text-red-400 mb-1">{agents.filter(a => !a.isActive).length}</div>
              <div className="text-xs font-medium text-slate-600 dark:text-zinc-500">Mitigated / Blocked</div>
            </div>
          </div>
          <div className="w-full bg-slate-100 dark:bg-zinc-950 rounded-full h-2 mb-2 flex overflow-hidden">
            <div className="bg-green-500 h-2" style={{ width: `${agents.filter(a => a.isActive).length / agents.length * 100 || 0}%` }}></div>
            <div className="bg-red-500 h-2" style={{ width: `${agents.filter(a => !a.isActive).length / agents.length * 100 || 0}%` }}></div>
          </div>
          <div className="flex justify-between text-[10px] font-semibold text-slate-500 dark:text-zinc-500 uppercase tracking-wider">
            <span>Healthy: {agents.filter(a => a.isActive).length}</span>
            <span>At Risk: {agents.filter(a => !a.isActive).length}</span>
          </div>
        </div>

        {/* Missing Patches by Severity (Threats) */}
        <div className="bg-white border border-slate-200 dark:bg-zinc-900 dark:border-zinc-800 rounded-xl p-6 shadow-sm dark:shadow-none">
          <div className="flex items-center gap-2 mb-6 text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            SOC Analyst Triage Pipeline
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-600 dark:text-zinc-400">Tier 2 Deep Investigation</span>
                <span className="text-red-500 dark:text-red-400 font-bold">{metrics.l2Threats}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-zinc-950 rounded-full h-1.5">
                <div className="bg-red-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${Math.min(metrics.l2Threats * 20, 100)}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-600 dark:text-zinc-400">Tier 1 Basic Investigation</span>
                <span className="text-orange-500 dark:text-orange-400 font-bold">{metrics.l1Threats}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-zinc-950 rounded-full h-1.5">
                <div className="bg-orange-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${Math.min(metrics.l1Threats * 20, 100)}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-600 dark:text-zinc-400">Moderate</span>
                <span className="text-yellow-500 dark:text-yellow-400 font-bold">{metrics.moderateThreats}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-zinc-950 rounded-full h-1.5">
                <div className="bg-yellow-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${Math.min(metrics.moderateThreats * 10, 100)}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-600 dark:text-zinc-400">Low</span>
                <span className="text-blue-500 dark:text-blue-400 font-bold">{metrics.lowThreats}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-zinc-950 rounded-full h-1.5">
                <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${Math.min(metrics.lowThreats * 5, 100)}%` }}></div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-8">
        
        {/* Bottom Panel: Interactive Threat Scanner */}
        <div className="lg:col-span-8 bg-white border border-slate-200 dark:bg-zinc-900 dark:border-zinc-800 rounded-xl p-6 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              Threat Feed Simulator
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isAutoPilot ? 'text-green-500 animate-pulse' : 'text-slate-400 dark:text-zinc-600'}`}>Autonomous Mode {isAutoPilot ? 'ON' : 'OFF'}</span>
              <button 
                onClick={() => {
                  if (!isConnected && !isAutoPilot) {
                    setStatus('Connect wallet first to use AutoPilot.');
                    return;
                  }
                  setIsAutoPilot(!isAutoPilot);
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isAutoPilot ? 'bg-green-500' : 'bg-slate-300 dark:bg-zinc-700'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAutoPilot ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
          
          <div className="flex gap-3 overflow-x-auto pb-4 mb-2 scrollbar-hide">
            {scenarios.map(s => (
              <button 
                key={s.id}
                onClick={() => handleScenario(s.data)}
                className="whitespace-nowrap bg-slate-50 border border-slate-200 dark:bg-zinc-950 dark:border-zinc-800 px-4 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:border-zinc-600 transition-colors border-l-2 text-left flex flex-col min-w-[180px]"
                style={{ borderLeftColor: s.level === 'L2' ? '#ef4444' : '#3b82f6' }}
              >
                <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-500 mb-0.5 tracking-wider">{s.level === 'L2' ? 'TIER 2' : 'TIER 1'} SCENARIO</span>
                <span className="text-xs font-medium text-slate-800 dark:text-zinc-200">{s.name}</span>
              </button>
            ))}
          </div>

          <div className="bg-slate-900 dark:bg-[#000000] p-5 rounded-lg border border-slate-800 dark:border-zinc-800/50 mt-2 relative font-mono shadow-inner">
             <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase tracking-widest font-sans">
                  {isStreaming ? 'Live Network Feed' : 'Raw Log Console'}
                </span>
                {threatData && (
                  <div className="flex items-center gap-2 font-sans">
                    <span className="px-2 py-0.5 rounded bg-slate-800 dark:bg-zinc-900 text-[10px] font-medium text-slate-300 dark:text-zinc-400 border border-slate-700 dark:border-zinc-800">
                      {threatData.threatType}
                    </span>
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${threatData.severity === 'L2' ? 'bg-red-500/20 text-red-400 border border-red-500/30 dark:bg-red-500/10 dark:border-red-500/20' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30 dark:bg-blue-500/10 dark:border-blue-500/20'}`}>
                      {threatData.severity} CLASSIFIED
                    </span>
                  </div>
                )}
              </div>
            
            {/* Live streaming benign logs */}
            {isStreaming && (
              <div className="mb-2 space-y-1 opacity-50 pointer-events-none select-none">
                {liveLogs.map((log, i) => (
                  <div key={i} className="text-slate-500 dark:text-zinc-600 text-[12px]">{log}</div>
                ))}
              </div>
            )}

            <textarea
              className={`w-full bg-transparent border-0 p-0 text-[13px] focus:outline-none focus:ring-0 resize-none ${isStreaming ? 'text-green-500/50 dark:text-green-600/50' : 'text-green-400 dark:text-green-500'}`}
              placeholder="Select a scenario or paste raw logs..."
              rows={isStreaming ? 2 : 6}
              value={task}
              onChange={(e) => {
                setTask(e.target.value);
                if (e.target.value) setIsStreaming(false);
              }}
              style={{ lineHeight: '1.6' }}
            />
            
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-800 dark:border-zinc-900/50 font-sans">
              <div className="flex flex-col gap-1">
                <span className={`text-xs font-medium ${status.includes('Malicious') ? 'text-red-400' : status.includes('Revoked') ? 'text-red-500' : 'text-slate-400 dark:text-zinc-500'}`}>{status}</span>
                {status.includes('Revoked') && (
                  <button onClick={() => setReportModal(true)} className="text-[10px] text-blue-400 hover:text-blue-300 font-bold uppercase tracking-wider text-left underline underline-offset-2">
                    View Tier 3 Forensics Report
                  </button>
                )}
              </div>
              <button
                onClick={handleScan}
                disabled={!task.trim() || status.includes('Scanning')}
                className="bg-white hover:bg-gray-100 text-slate-900 dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 px-6 py-2 rounded-md text-xs font-bold transition-colors disabled:opacity-50"
              >
                Execute Deep Scan
              </button>
            </div>
          </div>
        </div>

        {/* Active Agents List */}
        <div className="lg:col-span-4 bg-white border border-slate-200 dark:bg-zinc-900 dark:border-zinc-800 rounded-xl p-6 shadow-sm dark:shadow-none">
          <div className="flex items-center gap-2 mb-6 text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>
            Active Agents Fleet
          </div>
          <div className="space-y-3 h-[420px] overflow-y-auto pr-2 scrollbar-hide">
            {agents.map((agent) => (
              <AgentCard 
                key={agent.id} 
                agent={agent} 
              />
            ))}
          </div>
        </div>

      </div>

      {/* Recent Activity Log Table */}
      <div className="bg-white border border-slate-200 dark:bg-zinc-900 dark:border-zinc-800 rounded-xl p-6 shadow-sm dark:shadow-none w-full">
        <div className="flex items-center gap-2 mb-6 text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
          <Activity className="w-3 h-3" />
          Recent Scan Activity
        </div>
        
        {scanHistory.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-zinc-500 text-sm border border-dashed border-slate-200 dark:border-zinc-800 rounded-lg">
            No scans executed yet. Run a Deep Scan to see activity logs.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-zinc-400">
              <thead className="text-xs uppercase bg-slate-50 dark:bg-zinc-950/50 text-slate-500 dark:text-zinc-500 border-b border-slate-200 dark:border-zinc-800">
                <tr>
                  <th className="px-4 py-3 font-semibold">Time</th>
                  <th className="px-4 py-3 font-semibold">Classification</th>
                  <th className="px-4 py-3 font-semibold">Payload Snippet</th>
                  <th className="px-4 py-3 font-semibold text-right">System Action</th>
                </tr>
              </thead>
              <tbody>
                {scanHistory.map((scan) => (
                  <tr key={scan.id} className="border-b border-slate-100 dark:border-zinc-800/50 hover:bg-slate-50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">{scan.time}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${scan.severity === 'SAFE' ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'}`}>
                        {scan.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs truncate max-w-xs">{scan.payload}</td>
                    <td className={`px-4 py-3 text-right font-medium ${scan.action.includes('Kill Switch') ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                      {scan.action}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </main>
    </div>
  );
}
