// @ts-nocheck
"use client";

import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { GlassCard } from "@/components/glass/GlassCard";
import { Lock, CheckCircle2, Pencil, Loader2, RefreshCw, Clock, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import useSWR from "swr";
import { useSearchParams } from "next/navigation";
import CountUp from "react-countup";

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  ON_TRACK: { bg: "bg-emerald-500/10", text: "text-emerald-400", label: "On Track" },
  DELAYED: { bg: "bg-amber-500/10", text: "text-amber-400", label: "Delayed" },
  AT_RISK: { bg: "bg-rose-500/10", text: "text-rose-400", label: "At Risk" },
  COMPLETED: { bg: "bg-primary/10", text: "text-primary", label: "Completed" },
  PENDING_APPROVAL: { bg: "bg-violet-500/10", text: "text-violet-400", label: "Pending Approval" },
  REWORK_REQUIRED: { bg: "bg-rose-500/10", text: "text-rose-400", label: "Rework Required" },
  DRAFT: { bg: "bg-white/5", text: "text-muted-foreground", label: "Draft" },
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function CircularProgress({ value, size = 64, strokeWidth = 3, color, className = "" }: { value: number; size?: number; strokeWidth?: number; color?: string; className?: string }) {
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const safeValue = Math.min(Math.max(value, 0), 100);
  const dash = (safeValue / 100) * circ;
  const offset = circ - dash;
  const actualColor = color || (safeValue <= 40 ? "#f43f5e" : safeValue <= 70 ? "#f59e0b" : "#10b981");

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }} className={cn("transition-all duration-500 hover:rotate-6", className)}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke={actualColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${circ} ${circ}`}
        strokeDashoffset={offset}
        style={{
          transition: 'stroke-dashoffset 1.2s cubic-bezier(0.25, 1, 0.5, 1), stroke 0.4s ease',
          filter: `drop-shadow(0 0 6px ${actualColor}40)`
        }}
      />
    </svg>
  );
}

export default function DashboardClient() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingGoal, setUpdatingGoal] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  const progressInputRef = useRef<HTMLInputElement>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  const { data: goalsRaw = [], isLoading: loadingGoals, mutate: mutateGoals } = useSWR(
    user ? `/api/goals?employeeId=${user.id}` : null,
    fetcher,
    { refreshInterval: 8000 }
  );

  const { data: metrics, isLoading: loadingMetrics, mutate: mutateMetrics } = useSWR(
    user ? `/api/metrics?userId=${user.id}` : null,
    fetcher,
    { refreshInterval: 8000 }
  );

  const { data: allNotifsRaw = [], isLoading: loadingNotifs, mutate: mutateNotifs } = useSWR(
    user ? `/api/notifications?userId=${user.id}` : null,
    fetcher,
    { refreshInterval: 8000 }
  );

  const loading = loadingGoals || loadingMetrics || loadingNotifs;

  const safeNotifs = Array.isArray(allNotifsRaw) ? allNotifsRaw : [];
  const safeGoals = Array.isArray(goalsRaw) ? goalsRaw : [];
  const notifications = safeNotifs.slice(0, 4);

  const filteredGoals = safeGoals.filter((g) =>
    g.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.thrustArea?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.status?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fetchData = () => {
    mutateGoals();
    mutateMetrics();
    mutateNotifs();
  };

  const cycleStart = new Date("2024-07-01");
  const cycleEnd = new Date("2024-09-30");
  const today = new Date();
  const totalMs = cycleEnd.getTime() - cycleStart.getTime();
  const elapsedMs = today.getTime() - cycleStart.getTime();
  const daysRemaining = Math.max(0, Math.ceil((cycleEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  const cycleProgress = Math.min(100, Math.max(0, Math.round((elapsedMs / totalMs) * 100)));
  const cycleDone = today > cycleEnd;

  if (loading || !metrics) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <p className="text-sm text-muted-foreground animate-pulse">Syncing real-time data...</p>
      </div>
    );
  }

  const overallProgress = metrics?.overallProgress ?? 0;

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-semibold text-white">My Goals – FY24 Q3 Cycle</h1>
        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-muted-foreground">
          <Lock className="w-3 h-3" /> Cycle Locked
        </div>
        <button onClick={fetchData} className="p-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all" title="Refresh data">
          <RefreshCw className="w-3 h-3 text-muted-foreground" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="p-6 relative overflow-hidden group hover:border-violet-500/20 transition-all duration-300" gradient>
            <div className="absolute -right-16 -top-16 w-36 h-36 rounded-full bg-primary/10 opacity-20 blur-2xl group-hover:scale-125 transition-transform duration-500" />
            <div className="flex items-center gap-8">
              <div className="flex-1">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-semibold text-white flex items-center gap-2">
                    Overall Performance Index: <span className="text-violet-400 font-extrabold text-base"><CountUp end={overallProgress} duration={1.5} suffix="%" /></span>
                  </span>
                  <span className="px-2 py-0.5 bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded text-[9px] font-bold uppercase tracking-wider animate-pulse">Weighted Average · Live</span>
                </div>
                
                {/* Advanced Next-Gen Progress Bar */}
                <div className="relative w-full h-4 bg-slate-800/50 rounded-full overflow-hidden border border-white/5 shadow-inner">
                  {/* Animated gradient fill */}
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${overallProgress}%` }}
                    transition={{ duration: 1.5, ease: [0.25, 1, 0.5, 1] }}
                    className="h-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500
                               animate-gradient-x shadow-[0_0_20px_rgba(139,92,246,0.5)] relative rounded-full"
                  >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent
                                    animate-shimmer" />
                  </motion.div>
                  
                  {/* Milestone markers at 25%, 50%, 75%, 100% */}
                  {[25, 50, 75].map(milestone => (
                    <div 
                      key={milestone}
                      className={`absolute top-0 bottom-0 w-0.5 ${
                        overallProgress >= milestone ? 'bg-emerald-400' : 'bg-slate-600'
                      } transition-colors duration-500`}
                      style={{ left: `${milestone}%` }}
                    />
                  ))}
                </div>

                <div className="flex gap-6 mt-4">
                  <div className="text-center group/kpi cursor-pointer">
                    <p className="text-xs text-emerald-400 font-bold group-hover:scale-110 transition-transform"><CountUp end={metrics?.onTrack ?? 0} duration={1} /></p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">On Track</p>
                  </div>
                  <div className="text-center group/kpi cursor-pointer">
                    <p className="text-xs text-amber-400 font-bold group-hover:scale-110 transition-transform"><CountUp end={metrics?.delayed ?? 0} duration={1} /></p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Delayed</p>
                  </div>
                  <div className="text-center group/kpi cursor-pointer">
                    <p className="text-xs text-rose-400 font-bold group-hover:scale-110 transition-transform"><CountUp end={metrics?.atRisk ?? 0} duration={1} /></p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">At Risk</p>
                  </div>
                  <div className="text-center group/kpi cursor-pointer">
                    <p className="text-xs text-primary font-bold group-hover:scale-110 transition-transform"><CountUp end={metrics?.completed ?? 0} duration={1} /></p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Completed</p>
                  </div>
                </div>
              </div>
              <div className="relative shrink-0 group-hover:scale-105 transition-transform duration-300">
                <CircularProgress value={overallProgress} size={80} strokeWidth={6} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-white"><CountUp end={overallProgress} duration={1.5} suffix="%" /></span>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-0 overflow-hidden" gradient>
            <div className="flex h-[520px]">
              <div className="w-[180px] border-r border-white/10 flex flex-col shrink-0">
                <div className="p-6 border-b border-white/10">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Active Goals</span>
                  <span className="text-3xl font-bold text-white">{metrics?.totalGoals ?? 0}</span>
                </div>
                <div className="flex-1 py-6 px-6 space-y-8">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block mb-1">On Track</span>
                    <span className="text-2xl font-bold text-white">{metrics?.onTrack ?? 0}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block mb-1">At Risk</span>
                    <span className="text-2xl font-bold text-white">{metrics?.atRisk ?? 0}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest block mb-1">Delayed</span>
                    <span className="text-2xl font-bold text-white">{metrics?.delayed ?? 0}</span>
                  </div>
                </div>
                <div className="p-6 bg-white/[0.02] border-t border-white/10">
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                    <Clock className="w-3 h-3" />Q3 Active
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col min-w-0">
                <div className="p-5 border-b border-white/5 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">Execution Stream</h3>
                  <button onClick={fetchData} className="p-1.5 bg-white/5 rounded-lg hover:bg-white/10 transition-all">
                    <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-3">
                  {filteredGoals.length > 0 ? filteredGoals.map((goal) => {
                    const progress = goal.targetValue > 0 ? Math.min((goal.currentValue / goal.targetValue) * 100, 100) : 0;
                    const progressFixed = Number(progress.toFixed(1));
                    const status = statusColors[goal.status] || statusColors.DRAFT;
                    return (
                      <div key={goal.id} className="relative group/goal">
                        {/* Glowing active state border */}
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-2xl opacity-0 group-hover/goal:opacity-25 blur-sm transition-opacity duration-300 pointer-events-none" />
                        
                        <div className="relative p-4 rounded-2xl bg-white/[0.02] border border-white/5 group-hover/goal:border-violet-500/30 group-hover/goal:scale-[1.01] hover:shadow-2xl hover:shadow-violet-500/5 transition-all duration-300">
                          <div className="flex justify-between items-start mb-3">
                            <div className="space-y-1 flex-1 min-w-0 pr-3">
                              <span className="text-sm text-white font-semibold block truncate group-hover/goal:text-violet-300 transition-colors">{goal.title}</span>
                              <div className="flex items-center gap-2">
                                <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider", status.bg, status.text)}>
                                  {status.label}
                                </span>
                                <span className="text-[9px] text-muted-foreground font-medium">• {goal.thrustArea}</span>
                              </div>
                            </div>
                            <div className="text-right shrink-0 group-hover/goal:scale-105 transition-transform duration-300">
                              <div className="relative inline-flex items-center justify-center">
                                <CircularProgress value={progressFixed} size={44} strokeWidth={3.5} />
                                <span className="absolute text-[9px] font-extrabold text-white"><CountUp end={progressFixed} duration={1.5} suffix="%" /></span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                            <div className="flex gap-3">
                              <span>Target: <span className="text-white font-bold">{goal.targetValue}{goal.uom === "Percentage" ? "%" : ` ${goal.uom}`}</span></span>
                              <span>Weight: <span className="text-white font-bold">{goal.weightage}%</span></span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span>{new Date(goal.deadline).toLocaleDateString()}</span>
                              <button
                                onClick={() => setUpdatingGoal(goal)}
                                className="bg-primary/20 text-primary hover:bg-primary/35 px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all flex items-center gap-1 hover:scale-105 active:scale-95 shadow-[0_0_10px_rgba(59,130,246,0.2)]"
                              >
                                <Pencil className="w-2.5 h-2.5" /> Update
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Smart Hover Insights Panel (Slides Out to the Left) */}
                        <div className="absolute right-full mr-4 top-0 w-72 opacity-0 group-hover/goal:opacity-100 
                                        -translate-x-4 group-hover/goal:translate-x-0 transition-all duration-300
                                        bg-slate-950/95 backdrop-blur-xl border border-violet-500/20 rounded-2xl p-5
                                        pointer-events-none z-50 shadow-2xl shadow-black/80 hidden md:block">
                          <h4 className="text-[10px] font-bold text-violet-300 uppercase tracking-widest mb-3">Goal Context Insights</h4>
                          <div className="space-y-2 text-[10px]">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Target Value</span>
                              <span className="text-white font-bold">{goal.targetValue}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Current Progress</span>
                              <span className="text-emerald-400 font-bold">{goal.currentValue} ({progressFixed}%)</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Thrust Area</span>
                              <span className="text-cyan-400 truncate max-w-[120px] font-medium">{goal.thrustArea}</span>
                            </div>
                            <div className="flex justify-between border-t border-white/5 pt-2 mt-2">
                              <span className="text-slate-400">UoM</span>
                              <span className="text-fuchsia-400 font-medium">{goal.uom}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Active Cycle</span>
                              <span className="text-white font-medium">Q3 (Locked)</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-16">
                      {searchQuery ? (
                        <>
                          <Search className="w-8 h-8 mb-3" />
                          <p className="text-sm font-medium">No goals match &quot;{searchQuery}&quot;</p>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-8 h-8 mb-3" />
                          <p className="text-sm font-medium">No active goals found</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="space-y-6">
          <GlassCard className="p-6 flex items-center gap-5" gradient>
            <div className="relative shrink-0">
              <CircularProgress value={cycleDone ? 100 : cycleProgress} size={72} strokeWidth={5} color={cycleDone ? "#10b981" : "#3b82f6"} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-white">Q3</span>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Q3 Cycle Status</h3>
              <p className="text-[11px] text-muted-foreground font-medium mt-1">
                {cycleDone ? "Cycle Completed ✓" : `${daysRemaining} days remaining`}
              </p>
              <p className={`text-[11px] font-medium mt-1 ${cycleDone ? "text-emerald-400" : "text-primary"}`}>
                {cycleDone ? "100% complete" : `${cycleProgress}% elapsed`}
              </p>
            </div>
          </GlassCard>

          <GlassCard className="p-6 relative overflow-hidden group hover:border-violet-500/20 transition-all duration-300">
            <h3 className="text-sm font-semibold text-white mb-4">Quarterly Check-in</h3>
            <div className="space-y-4">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs relative overflow-hidden">
                <div className="absolute right-2 top-2 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <p className="text-white font-semibold mb-1">Status: Open for Submission</p>
                <p className="text-muted-foreground leading-relaxed">Manager review begins Sep 20, 2024</p>
              </div>
              
              <button
                onClick={async () => {
                  setIsSubmitting(true);
                  try {
                    await fetch("/api/goals", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ action: "QUARTERLY_SUBMIT", userId: user?.id }),
                    }).catch(() => {});
                    await new Promise((r) => setTimeout(r, 800));
                    toast("success", "Quarterly check-in submitted!");
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                disabled={isSubmitting}
                className="group relative w-full overflow-hidden rounded-xl
                           bg-gradient-to-r from-violet-600 to-fuchsia-600
                           px-6 py-3.5 font-bold text-white text-xs
                           transition-all duration-300
                           hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]
                           hover:scale-[1.02]
                           active:scale-[0.98] disabled:opacity-50"
              >
                {/* Animated shine effect on hover */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full
                                bg-gradient-to-r from-transparent via-white/30 to-transparent
                                transition-transform duration-700" />
                
                <span className="relative flex items-center justify-center gap-2">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Syncing Submission...
                    </>
                  ) : (
                    <>
                      Submit Update
                      <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" 
                           fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </span>
              </button>
            </div>
          </GlassCard>

          <GlassCard className="p-6 relative overflow-hidden group hover:border-violet-500/20 transition-all duration-300">
            <h3 className="text-sm font-semibold text-white mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {notifications.length > 0 ? notifications.map((notif, i) => (
                <div 
                  key={notif.id} 
                  className="flex gap-4 relative group/feed hover:bg-white/[0.01] p-2 rounded-xl transition-all duration-300"
                >
                  {i !== notifications.length - 1 && (
                    <div className="absolute left-5.5 top-8 bottom-[-20px] w-px bg-white/5" />
                  )}
                  <div className="relative shrink-0 z-10">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center border border-violet-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    </div>
                    {i === 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-violet-400 rounded-full animate-ping" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-[11px] font-semibold text-white leading-tight group-hover/feed:text-violet-300 transition-colors truncate">
                      {notif.title}
                    </h4>
                    <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                      {notif.message}
                    </p>
                    <span className="text-[9px] text-muted-foreground mt-1.5 block opacity-50">
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              )) : (
                <p className="text-[11px] text-muted-foreground text-center py-4">No recent activity</p>
              )}
            </div>
          </GlassCard>
        </div>
      </div>

      <AnimatePresence>
        {updatingGoal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) setUpdatingGoal(null); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md"
            >
              <GlassCard className="p-6 border-primary/20 shadow-2xl shadow-primary/10">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-bold text-white">Update Progress</h3>
                  <button onClick={() => setUpdatingGoal(null)} className="p-1.5 rounded-lg hover:bg-white/10 transition-all">
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{updatingGoal.title}</p>

                <div className="flex items-center gap-4 mb-6 p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="relative">
                    <CircularProgress
                      value={updatingGoal.targetValue > 0 ? Math.min((updatingGoal.currentValue / updatingGoal.targetValue) * 100, 100) : 0}
                      size={52} strokeWidth={4}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-white">
                        {updatingGoal.targetValue > 0 ? Math.min(Math.round((updatingGoal.currentValue / updatingGoal.targetValue) * 100), 100) : 0}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Current: <span className="text-white font-bold">{updatingGoal.currentValue} {updatingGoal.uom === "Percentage" ? "%" : updatingGoal.uom}</span></p>
                    <p className="text-xs text-muted-foreground">Target: <span className="text-white font-bold">{updatingGoal.targetValue} {updatingGoal.uom === "Percentage" ? "%" : updatingGoal.uom}</span></p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-white/80 tracking-wide uppercase mb-2 block">
                      New Achievement ({updatingGoal.uom})
                    </label>
                    <div className="relative">
                      <input
                        ref={progressInputRef}
                        type="number"
                        defaultValue={updatingGoal.currentValue}
                        min={0}
                        max={updatingGoal.targetValue}
                        className="w-full bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
                      />
                      {updatingGoal.uom === "Percentage" && (
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-white/80 tracking-wide uppercase mb-2 block">
                      Narrative / Accomplishment Comments *
                    </label>
                    <textarea
                      ref={commentInputRef}
                      required
                      placeholder="Type details of what you achieved..."
                      rows={3}
                      className="w-full bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder-muted-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none"
                    />
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={() => setUpdatingGoal(null)}
                      className="flex-1 py-3 rounded-xl bg-white/5 text-white text-sm font-medium hover:bg-white/10 transition-all border border-white/10"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        const val = progressInputRef.current?.value;
                        const commentVal = commentInputRef.current?.value || "";
                        if (val === undefined || val === "") return;

                        setIsUpdating(true);
                        try {
                          const res = await fetch("/api/goals", {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ 
                              goalId: updatingGoal.id, 
                              action: "UPDATE_PROGRESS", 
                              currentValue: Number(val),
                              comment: commentVal
                            }),
                          });
                          if (!res.ok) throw new Error("Failed");
                          toast("success", "Progress updated successfully!");
                          await mutateGoals();
                          await mutateMetrics();
                          setUpdatingGoal(null);
                        } catch {
                          toast("error", "Failed to update progress");
                        } finally {
                          setIsUpdating(false);
                        }
                      }}
                      disabled={isUpdating}
                      className="flex-1 py-3 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-50 text-white text-sm font-bold transition-all shadow-lg flex justify-center items-center gap-2"
                    >
                      {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Update"}
                    </button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
