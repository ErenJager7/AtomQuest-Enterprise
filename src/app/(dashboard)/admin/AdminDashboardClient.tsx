// @ts-nocheck
"use client";

import { GlassCard } from "@/components/glass/GlassCard";
import {
  Shield, Activity, History, Lock, Settings,
  UserPlus, RefreshCw, Database, Cpu, Globe, Search, X
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/lib/toast-context";
import { cn } from "@/lib/utils";
import useSWR from "swr";
import { useSearchParams } from "next/navigation";
import { Download, Zap, HardDrive, DollarSign } from "lucide-react";
import { motion } from "framer-motion";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function CircularProgress({ value, size = 80, strokeWidth = 6, color = "#3b82f6" }: any) {
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const safeVal = Math.min(Math.max(value, 0), 100);
  const dash = (safeVal / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${circ} ${circ}`}
        strokeDashoffset={circ - dash}
        style={{
          stroke: color,
          transition: 'stroke-dashoffset 1.3s cubic-bezier(0.25, 1, 0.5, 1)',
        }}
      />
    </svg>
  );
}

export default function AdminDashboardClient() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  const [actionSearch, setActionSearch] = useState("");

  const { data: logsRaw = [], isLoading: loadingLogs, mutate: mutateLogs } = useSWR(
    "/api/audit-logs",
    fetcher,
    { refreshInterval: 10000 }
  );

  const { data: usersRaw = [], isLoading: loadingUsers, mutate: mutateUsers } = useSWR(
    "/api/users",
    fetcher,
    { refreshInterval: 10000 }
  );

  const { data: goalsRaw = [], isLoading: loadingGoals } = useSWR(
    "/api/goals",
    fetcher,
    { refreshInterval: 10000 }
  );

  const loading = loadingLogs || loadingUsers;

  const safeUsers = Array.isArray(usersRaw) ? usersRaw : [];
  const safeLogs = Array.isArray(logsRaw) ? logsRaw : [];
  const safeGoals = Array.isArray(goalsRaw) ? goalsRaw : [];

  const totalGoals = safeGoals.length;
  const pendingGoals = safeGoals.filter((g) => g.status === "PENDING_APPROVAL").length;
  const approvedGoals = safeGoals.filter((g) => g.status === "APPROVED").length;
  const goalCompletionRate = totalGoals > 0 ? Math.round((approvedGoals / totalGoals) * 100) : 0;

  const filteredLogs = safeLogs.filter((log) => {
    const userName = safeUsers.find((u) => u.id === log.userId)?.name ?? "System";
    const actionText = log.action ?? "";
    const details = log.newValue ?? log.details ?? "";
    const q = searchQuery.toLowerCase();
    return (
      userName.toLowerCase().includes(q) ||
      actionText.toLowerCase().includes(q) ||
      details.toLowerCase().includes(q)
    );
  });

  const refreshAll = () => {
    mutateLogs();
    mutateUsers();
    toast("success", "Data refreshed");
  };

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading admin intelligence...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">System Intelligence Control</h1>
          <p className="text-sm text-muted-foreground mt-1">Enterprise-wide audit logs and configuration · Live</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const headers = ["Event ID", "Timestamp", "Actor Name", "Role", "Action Type", "Details / Changes"];
              const rows = filteredLogs.map(log => {
                const actor = safeUsers.find((u) => u.id === log.userId);
                return [
                  log.id,
                  `"${new Date(log.timestamp).toLocaleString()}"`,
                  `"${actor?.name || 'System'}"`,
                  `"${actor?.role || 'SYSTEM'}"`,
                  `"${log.action || ''}"`,
                  `"${(log.newValue || log.details || '').replace(/"/g, '""')}"`
                ];
              });
              const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
              const link = document.createElement("a");
              link.setAttribute("href", encodeURI(csvContent));
              link.setAttribute("download", "audit_logs_export.csv");
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              toast("success", "Export Complete", "Beautified audit logs CSV file has been downloaded.");
            }}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-semibold hover:bg-emerald-500/20 transition-all shadow-lg shadow-emerald-500/10"
          >
            <Download className="w-3 h-3" /> Export CSV
          </button>
          
          <button
            onClick={() => {
              const exportData = filteredLogs.map(log => {
                const actor = safeUsers.find((u) => u.id === log.userId);
                return {
                  'Event ID': log.id,
                  'Timestamp': new Date(log.timestamp).toLocaleString(),
                  'Actor': actor?.name || 'System',
                  'Role': actor?.role || 'SYSTEM',
                  'Action Type': log.action || '',
                  'Details': log.newValue || log.details || ''
                };
              });
              import('@/lib/pdf-export').then((module) => {
                module.exportAnalyticsToPDF(exportData, 'Audit Logs Report');
                toast("success", "Export Complete", "PDF report has been downloaded.");
              });
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 text-primary rounded-xl text-xs font-semibold hover:bg-primary/20 transition-all shadow-lg shadow-primary/10"
          >
            <Download className="w-3 h-3" /> Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Active Users", value: safeUsers.length, icon: Database, color: "text-blue-400",
            ring: Math.round((safeUsers.length / Math.max(safeUsers.length + 2, 1)) * 100), ringColor: "#60a5fa"
          },
          {
            label: "Goal Completion", value: `${goalCompletionRate}%`, icon: Activity, color: "text-emerald-400",
            ring: goalCompletionRate, ringColor: "#34d399"
          },
          {
            label: "Pending Approvals", value: pendingGoals, icon: Globe, color: "text-amber-400",
            ring: totalGoals > 0 ? Math.round((pendingGoals / totalGoals) * 100) : 0, ringColor: "#fbbf24"
          },
          {
            label: "Total Goals", value: totalGoals, icon: Cpu, color: "text-violet-400",
            ring: Math.min(totalGoals * 10, 100), ringColor: "#a78bfa"
          },
        ].map((kpi, i) => (
          <GlassCard key={i} className="p-5" gradient>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-medium text-muted-foreground">{kpi.label}</p>
                <h3 className="text-2xl font-bold text-white mt-1">{kpi.value}</h3>
              </div>
              <div className="relative shrink-0">
                <CircularProgress value={kpi.ring} size={52} strokeWidth={4} color={kpi.ringColor} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <kpi.icon className={cn("w-3.5 h-3.5", kpi.color)} />
                </div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <GlassCard className="p-5" gradient>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" /> Infrastructure & Costs
              </h3>
              <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">Optimized</span>
            </div>
            
            <div className="space-y-4">
              <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1"><DollarSign className="w-3 h-3" /> API Tokens (Gemini)</span>
                  <span className="text-xs font-semibold text-white">$1.24 / mo</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 w-[15%]" />
                </div>
              </div>

              <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1"><HardDrive className="w-3 h-3" /> Prisma DB Storage</span>
                  <span className="text-xs font-semibold text-white">42 MB / 1 GB</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-400 w-[4%]" />
                </div>
              </div>
              
              <p className="text-[10px] text-muted-foreground text-center mt-2 leading-relaxed">
                Operating at <strong className="text-white">92% cost efficiency</strong> compared to standard enterprise baselines.
              </p>
            </div>
          </GlassCard>

          <GlassCard className="p-6" gradient>
            <h3 className="text-sm font-semibold text-white mb-5">Cycle Lifecycle Management</h3>
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-primary uppercase">Current Cycle</span>
                  <span className="px-2 py-0.5 bg-emerald-500 text-white rounded text-[9px] font-bold uppercase">Active</span>
                </div>
                <h4 className="text-lg font-bold text-white">FY24 Q3</h4>
                <p className="text-[10px] text-primary/70 font-medium mt-1">July 01 – Sept 30, 2024</p>
                <div className="mt-5 flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold text-white transition-all">
                    <Lock className="w-3 h-3" /> Lock All
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold text-white transition-all">
                    <RefreshCw className="w-3 h-3" /> Rollover
                  </button>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="lg:col-span-2">
          <GlassCard className="p-0 overflow-hidden h-full">
            <div className="p-5 border-b border-white/5 flex items-center justify-between gap-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2 shrink-0">
                <History className="w-4 h-4 text-primary" /> Live Audit Stream
              </h3>
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest shrink-0">{filteredLogs.length} events</span>
            </div>
            <div className="max-h-[560px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-[#030712]/95 z-10 backdrop-blur-sm">
                  <tr className="border-b border-white/5">
                    <th className="px-5 py-3.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Timestamp</th>
                    <th className="px-5 py-3.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">User</th>
                    <th className="px-5 py-3.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Action</th>
                    <th className="px-5 py-3.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {filteredLogs.length > 0 ? filteredLogs.map((log) => (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-5 py-3.5 text-[11px] text-muted-foreground whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="px-5 py-3.5 text-[11px] font-medium text-white whitespace-nowrap">
                        {safeUsers.find((u) => u.id === log.userId)?.name ?? "System"}
                      </td>
                      <td className="px-5 py-3.5 text-[11px]">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border",
                          log.action?.includes("APPROVED") ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                          log.action?.includes("REJECTED") ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                          log.action?.includes("CREATED") ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                          "bg-white/5 text-muted-foreground border-white/10"
                        )}>
                          {log.action?.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[11px] text-muted-foreground max-w-[240px] truncate">
                        {log.newValue ?? log.details ?? "—"}
                      </td>
                    </motion.tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="text-center py-12 text-muted-foreground text-sm">
                        {searchQuery ? `No logs matching "${searchQuery}"` : "No audit logs found"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>

        <div className="lg:col-span-1 space-y-5">
          <GlassCard className="p-6" gradient>
            <h3 className="text-sm font-semibold text-white mb-5">Cycle Lifecycle Management</h3>
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-primary uppercase">Current Cycle</span>
                  <span className="px-2 py-0.5 bg-emerald-500 text-white rounded text-[9px] font-bold uppercase">Active</span>
                </div>
                <h4 className="text-lg font-bold text-white">FY24 Q3</h4>
                <p className="text-[10px] text-primary/70 font-medium mt-1">July 01 – Sept 30, 2024</p>
                <div className="mt-5 flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold text-white transition-all">
                    <Lock className="w-3 h-3" /> Lock All
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold text-white transition-all">
                    <RefreshCw className="w-3 h-3" /> Rollover
                  </button>
                </div>
              </div>
              <div className="p-4 rounded-2xl border border-dashed border-white/10 opacity-50">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase">Next Cycle</span>
                  <span className="px-2 py-0.5 bg-white/10 text-muted-foreground rounded text-[9px] font-bold uppercase">Queued</span>
                </div>
                <h4 className="text-lg font-bold text-white/50">FY24 Q4</h4>
                <p className="text-[10px] text-muted-foreground/50 font-medium mt-1">Oct 01 – Dec 31, 2024</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-sm font-semibold text-white mb-5">Goals Overview · Live</h3>
            <div className="flex flex-col items-center mb-5">
              <div className="relative">
                <CircularProgress value={goalCompletionRate} size={100} strokeWidth={8} color="#34d399" />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-white">{goalCompletionRate}%</span>
                  <span className="text-[9px] text-muted-foreground">Approved</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {[
                { label: "Total Goals", value: totalGoals, color: "bg-white/20" },
                { label: "Approved", value: approvedGoals, color: "bg-emerald-500" },
                { label: "Pending", value: pendingGoals, color: "bg-amber-500" },
                { label: "Draft / Other", value: totalGoals - approvedGoals - pendingGoals, color: "bg-white/10" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", item.color)} />
                    <span className="text-[11px] text-muted-foreground">{item.label}</span>
                  </div>
                  <span className="text-[11px] font-bold text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Admin Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Security Audit", icon: Shield },
                { label: "Export Logs", icon: History },
                { label: "System Sync", icon: RefreshCw },
                { label: "Config", icon: Settings },
              ].map((act, i) => (
                <button key={i} onClick={() => toast("success", `${act.label} initiated`)} className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-center group">
                  <act.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary mx-auto mb-1.5 transition-colors" />
                  <span className="text-[10px] font-bold text-muted-foreground group-hover:text-white uppercase tracking-wider">{act.label}</span>
                </button>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
