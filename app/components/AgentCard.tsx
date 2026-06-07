"use client";

export default function AgentCard({ agent }: { agent: any }) {
  const isActive = agent.isActive;
  
  return (
    <div className={`p-4 rounded-xl border transition-all ${
      isActive 
        ? 'bg-slate-50 border-slate-200 shadow-sm dark:bg-zinc-950 dark:border-zinc-800 dark:shadow-none' 
        : 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900/50'
    }`}>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-slate-800 dark:text-zinc-100">Agent #{agent.id}</h3>
          <p className="text-xs text-slate-500 dark:text-zinc-500 font-mono mt-1">{agent.address.slice(0, 6)}...{agent.address.slice(-4)}</p>
          {agent.clearance && <p className="text-[10px] uppercase text-blue-600 dark:text-blue-400 mt-2 font-bold tracking-wider">{agent.clearance} CLEARANCE</p>}
        </div>
        <div className={`px-2 py-1 rounded text-[10px] font-bold border tracking-wider ${
          isActive 
            ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20' 
            : 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'
        }`}>
          {isActive ? 'ACTIVE' : 'REVOKED'}
        </div>
      </div>
      
      {/* Visual pulse for active agent */}
      {isActive && (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-zinc-800/50">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
          </span>
          <span className="text-[10px] uppercase text-slate-500 dark:text-zinc-500 font-medium tracking-wider">Monitoring Monad Chain</span>
        </div>
      )}
    </div>
  );
}
