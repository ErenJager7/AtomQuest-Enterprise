// @ts-nocheck
"use client";

import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { GlassCard } from "@/components/glass/GlassCard";
import {
  Users, CheckCircle2, XCircle, Clock, Search, Filter,
  ArrowUpRight, MessageSquare, Loader2, RefreshCw, X
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import useSWR from "swr";
import { useSearchParams } from "next/navigation";
import confetti from "canvas-confetti";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function CircularProgress({ value, size = 56, strokeWidth = 4, color }: { value: number; size?: number; strokeWidth?: number; color?: string }) {
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const safeValue = Math.min(Math.max(value, 0), 100);
  const dash = (safeValue / 100) * circ;
  const actualColor = color || (safeValue <= 40 ? "#f43f5e" : safeValue <= 70 ? "#f59e0b" : "#10b981");
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }} className="transition-transform duration-500 hover:rotate-12">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${circ} ${circ}`}
        strokeDashoffset={circ - dash}
        style={{
          stroke: actualColor,
          transition: 'stroke-dashoffset 1.2s cubic-bezier(0.25, 1, 0.5, 1)',
          filter: `drop-shadow(0 0 4px ${actualColor}40)`
        }}
      />
    </svg>
  );
}

export default function ManagerDashboardClient() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") || "";

  const { data: teamRaw = [], isLoading: loadingTeam, mutate: mutateTeam } = useSWR(
    user ? `/api/users?managerId=${user.id}` : null,
    fetcher,
    { refreshInterval: 12000 }
  );

  const { data: allPendingRaw = [], isLoading: loadingGoals, mutate: mutateGoals } = useSWR(
    user ? `/api/goals?status=PENDING_APPROVAL` : null,
    fetcher,
    { refreshInterval: 12000 }
  );

  const { data: allTeamGoalsRaw = [] } = useSWR(
    user ? `/api/goals` : null,
    fetcher,
    { refreshInterval: 12000 }
  );

  const loading = loadingTeam || loadingGoals;

  const safeTeam = Array.isArray(teamRaw) ? teamRaw : [];
  const safePending = Array.isArray(allPendingRaw) ? allPendingRaw : [];
  const safeAllGoals = Array.isArray(allTeamGoalsRaw) ? allTeamGoalsRaw : [];

  const teamIds = new Set(safeTeam.map((u) => u.id));
  const pendingGoals = safePending.filter((g) => teamIds.has(g.employeeId));

  const memberProgress = (memberId: string) => {
    const memberGoals = safeAllGoals.filter((g) => g.employeeId === memberId);
    if (memberGoals.length === 0) return 0;
    const total = memberGoals.reduce((acc, g) => {
      const p = g.targetValue > 0 ? Math.min((g.currentValue / g.targetValue) * 100, 100) : 0;
      return acc + p * (g.weightage / 100);
    }, 0);
    return Math.round(total);
  };

  const teamAvgProgress = safeTeam.length > 0
    ? Math.round(safeTeam.reduce((sum, m) => sum + memberProgress(m.id), 0) / safeTeam.length)
    : 0;

  const filteredTeam = safeTeam.filter(
    (m) => m.name?.toLowerCase().includes(searchQuery.toLowerCase()) || m.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAction = async (goalId: string, action: string) => {
    setProcessingId(goalId);
    mutateGoals(allPendingRaw.filter((g) => g.id !== goalId), false);
    try {
      const res = await fetch("/api/goals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goalId, action }),
      });
      if (res.ok) {
        if (action === "APPROVE") {
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#8b5cf6', '#d946ef', '#06b6d4', '#10b981']
          });
        }
        toast("success", `Goal ${action === "APPROVE" ? "approved" : "rejected"} successfully`);
        mutateGoals();
      } else {
        toast("error", `Failed to ${action.toLowerCase()} goal`);
        mutateGoals();
      }
    } catch {
      toast("error", "Network error during action");
      mutateGoals();
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <p className="text-sm text-muted-foreground animate-pulse">Syncing real-time team data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Team Performance Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">Managing {safeTeam.length} direct reports · Live</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const headers = [
                "Full Name",
                "Email Address",
                "Job Title",
                "Department",
                "Approved Goals",
                "Pending Approvals",
                "Progress Score"
              ];
              const rows = filteredTeam.map(m => [
                `"${m.name}"`,
                `"${m.email}"`,
                `"${m.jobTitle || 'N/A'}"`,
                `"${m.department?.name || m.departmentId || 'General'}"`,
                m.goals ? m.goals.filter((g: any) => g.status === 'APPROVED').length : 0,
                m.goals ? m.goals.filter((g: any) => g.status === 'PENDING_APPROVAL').length : 0,
                `"${memberProgress(m.id)}%"`
              ]);
              const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
              const link = document.createElement("a");
              link.setAttribute("href", encodeURI(csvContent));
              link.setAttribute("download", "team_report.csv");
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              toast("success", "Export Complete", "A beautiful team report CSV has been downloaded.");
            }}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm font-semibold hover:bg-emerald-500/20 transition-all shadow-lg shadow-emerald-500/10"
          >
            Export CSV
          </button>
          <button onClick={() => { mutateGoals(); mutateTeam(); }} className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Team Avg Progress", value: `${teamAvgProgress}%`, icon: ArrowUpRight, color: "text-primary" },
          { label: "Pending Approvals", value: pendingGoals.length, icon: Clock, color: "text-amber-400" },
          { label: "Team Size", value: safeTeam.length, icon: Users, color: "text-violet-400" },
          { label: "Goals In Review", value: safePending.length, icon: CheckCircle2, color: "text-emerald-400" },
        ].map((kpi, i) => (
          <GlassCard key={i} className="p-5" gradient>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-medium text-muted-foreground">{kpi.label}</p>
                <h3 className="text-2xl font-bold text-white mt-2">{kpi.value}</h3>
              </div>
              <div className={`p-2 rounded-lg bg-white/5 border border-white/10 ${kpi.color}`}>
                <kpi.icon className="w-4 h-4" />
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold text-white">Pending Approvals</h3>
              {pendingGoals.length > 0 && (
                <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded text-[10px] font-bold uppercase tracking-wider">
                  {pendingGoals.length} Action Required
                </span>
              )}
            </div>

            <div className="space-y-3 max-h-[360px] overflow-y-auto custom-scrollbar pr-1">
              <AnimatePresence mode="popLayout">
                {pendingGoals.length > 0 ? pendingGoals.map((goal) => (
                  <motion.div
                    key={goal.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-primary/20 transition-all"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                          <span className="text-xs font-bold text-primary">
                            {goal.employee?.name?.charAt(0) ?? "?"}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-white truncate">{goal.title}</h4>
                          <p className="text-[10px] text-muted-foreground">{goal.employee?.name} · {goal.thrustArea}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleAction(goal.id, "APPROVE")}
                          disabled={processingId === goal.id}
                          title="Approve"
                          className="p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl hover:bg-emerald-500/20 active:scale-95 hover:scale-105 transition-all disabled:opacity-50"
                        >
                          {processingId === goal.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleAction(goal.id, "REJECT")}
                          disabled={processingId === goal.id}
                          title="Reject"
                          className="p-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl hover:bg-rose-500/20 hover:animate-shake active:scale-95 transition-all disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                        <button title="Comment" className="p-2 bg-white/5 text-muted-foreground border border-white/10 rounded-xl hover:bg-white/10 transition-all hover:scale-105 active:scale-95">
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )) : (
                  <div className="py-12 text-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500/20 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-white/40">All caught up!</p>
                    <p className="text-xs text-muted-foreground mt-1">No pending approvals</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold text-white">Team Members</h3>
              <span className="text-[10px] text-muted-foreground">{filteredTeam.length} of {safeTeam.length}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[320px] overflow-y-auto custom-scrollbar pr-1">
              {filteredTeam.length > 0 ? filteredTeam.map((member) => {
                const prog = memberProgress(member.id);
                return (
                  <div key={member.id} className="relative group/member">
                    {/* Glowing background glow on hover */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-2xl opacity-0 group-hover/member:opacity-15 blur-sm transition-opacity duration-300 pointer-events-none" />
                    
                    <div className="relative p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-3 hover:border-violet-500/20 group-hover/member:scale-[1.02] transition-all duration-300">
                      <div className="relative shrink-0 group-hover/member:scale-110 group-hover/member:rotate-6 transition-transform duration-300">
                        <CircularProgress value={prog} size={48} strokeWidth={3.5} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[9px] font-extrabold text-white">{prog}%</span>
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white truncate group-hover/member:text-violet-300 transition-colors">{member.name}</p>
                        <p className="text-[10px] text-muted-foreground font-medium truncate">{member.jobTitle}</p>
                        <div className="mt-1">
                          <span className={cn(
                            "text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider",
                            prog >= 70 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : 
                            prog >= 40 ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : 
                            "bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse"
                          )}>
                            {prog >= 70 ? "On Track" : prog >= 40 ? "Needs Attention" : "Behind Schedule"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="col-span-2 text-center py-8 text-muted-foreground text-sm">
                  {searchQuery ? `No members match "${searchQuery}"` : "No team members found"}
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        <div className="lg:col-span-1">
          <GlassCard className="p-6 h-full" gradient>
            <h3 className="text-sm font-semibold text-white mb-6">Team Velocity</h3>

            <div className="flex flex-col items-center mb-8">
              <div className="relative">
                <CircularProgress value={teamAvgProgress} size={120} strokeWidth={8} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-white">{teamAvgProgress}%</span>
                  <span className="text-[10px] text-muted-foreground">Avg Progress</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Member Breakdown</h4>
              {safeTeam.slice(0, 4).map((m) => {
                const prog = memberProgress(m.id);
                return (
                  <div key={m.id} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[9px] font-bold text-primary shrink-0">
                      {m.name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between mb-1">
                        <span className="text-[10px] text-white truncate">{m.name?.split(" ")[0]}</span>
                        <span className="text-[10px] font-bold text-primary">{prog}%</span>
                      </div>
                      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-primary rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${prog}%` }}
                          transition={{ duration: 1, ease: [0.25, 1, 0.5, 1] }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
