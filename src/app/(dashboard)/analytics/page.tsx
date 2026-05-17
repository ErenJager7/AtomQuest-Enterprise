// @ts-nocheck
"use client";

export const dynamic = 'force-dynamic';

import { GlassCard } from "@/components/glass/GlassCard";
import { AIAssistantDock } from "@/components/glass/AIAssistantDock";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell } from "recharts";

import { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/lib/auth-context";
import useSWR from "swr";
import { Loader2 } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function AnalyticsDashboardContent() {
  const { user } = useAuth();
  
  const [trendData, setTrendData] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [distributionData, setDistributionData] = useState(null);
  const [managerData, setManagerData] = useState([]);
  const [insights, setInsights] = useState([]);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const loadAnalytics = () => {
      fetch('/api/analytics/qoq-trends').then(res => res.json()).then(data => {
        // Map department data to chart format
        const chartData = ['Q1', 'Q2', 'Q3', 'Q4'].map((q, idx) => {
          const point = { name: q };
          data.department?.forEach(d => { point[d.dept] = d[`q${idx+1}Avg`]; });
          return point;
        });
        setTrendData(chartData);
      });
      fetch('/api/analytics/completion-heatmap').then(res => res.json()).then(data => setHeatmapData(data.heatmapData || []));
      fetch('/api/analytics/goal-distribution').then(res => res.json()).then(data => setDistributionData(data));
      fetch('/api/analytics/manager-effectiveness').then(res => res.json()).then(data => setManagerData(data.managers || []));
      fetch('/api/analytics/ai-insights').then(res => res.json()).then(data => {
        setInsights(data.insights || []);
        setIsInitializing(false);
      });
    };

    fetch('/api/analytics/data-exists').then(res => {
      if (!res.ok) {
        fetch('/api/seed-analytics-data', { method: 'POST' })
          .then(() => loadAnalytics());
      } else {
        loadAnalytics();
      }
    });
  }, []);

  const { data: metrics, isLoading } = useSWR(
    user ? `/api/metrics?userId=${user.id}` : null,
    fetcher,
    { refreshInterval: 12000 }
  );

  const pieData = distributionData?.byStatus ? distributionData.byStatus.map(d => ({
    name: d.status,
    value: d.count,
    color: d.status === 'APPROVED' || d.status === 'COMPLETED' ? '#3b82f6' : d.status === 'ON_TRACK' ? '#34d399' : d.status === 'AT_RISK' ? '#f87171' : '#fbbf24'
  })) : [];

  const handleAIUpdate = (data: any) => {
    if (data?.dynamicDataUpdate) {
      const { trendShift = 10, completedInc = 1 } = data.dynamicDataUpdate;
      
      // 1. Shift trend data dynamically
      setTrendData(prev => prev.map(item => {
        const newItem = { ...item };
        Object.keys(newItem).forEach(key => {
          if (key !== 'name' && typeof newItem[key] === 'number') {
            newItem[key] = Math.min(100, newItem[key] + Math.floor(Math.random() * trendShift));
          }
        });
        return newItem;
      }));

      // 2. Tweak distribution data
      if (distributionData?.byThrustArea) {
        setDistributionData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            byThrustArea: prev.byThrustArea.map((d: any) => ({
              ...d,
              count: d.count + completedInc
            }))
          };
        });
      }
    }
  };

  if (isLoading || isInitializing) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading Analytics Engine...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Advanced Analytics & AI Insights</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Main Analytics Area (3/4 width) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Premium Heatmap Grid */}
          <GlassCard className="p-6" gradient>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-semibold text-white tracking-tight">Performance Heatmap</h3>
              <div className="flex items-center gap-5 text-[11px]" style={{ opacity: 0.7 }}>
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm" style={{ background: 'rgba(59,130,246,0.18)', border: '1.5px solid #3b82f6' }} />
                  On Track
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm" style={{ background: 'rgba(20,184,166,0.18)', border: '1.5px solid #14b8a6' }} />
                  Delayed
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm" style={{ background: 'rgba(249,115,22,0.18)', border: '1.5px solid #f97316' }} />
                  At Risk
                </span>
              </div>
            </div>

            <div className="w-full space-y-2">
              {/* Column headers */}
              <div className="grid gap-2" style={{ gridTemplateColumns: '100px 1fr 1fr 1fr' }}>
                <div />
                {['Engineering', 'Marketing', 'Sales'].map(h => (
                  <div key={h} className="text-center text-[11px] font-semibold pb-1" style={{ opacity: 0.45 }}>{h}</div>
                ))}
              </div>

              {/* Row: Engineering */}
              <div className="grid gap-2 h-11" style={{ gridTemplateColumns: '100px 1fr 1fr 1fr' }}>
                <div className="text-[11px] flex items-center font-medium" style={{ opacity: 0.45 }}>Engineering</div>
                <div className="heatmap-cell heatmap-on-track">On Track</div>
                <div className="heatmap-cell heatmap-delayed">Delayed</div>
                <div className="heatmap-cell heatmap-at-risk">At Risk</div>
              </div>

              {/* Row: Marketing */}
              <div className="grid gap-2 h-11" style={{ gridTemplateColumns: '100px 1fr 1fr 1fr' }}>
                <div className="text-[11px] flex items-center font-medium" style={{ opacity: 0.45 }}>Marketing</div>
                <div className="heatmap-cell heatmap-on-track">On Track</div>
                <div className="heatmap-cell heatmap-on-track">On Track</div>
                <div className="heatmap-cell heatmap-at-risk">At Risk</div>
              </div>

              {/* Row: Sales */}
              <div className="grid gap-2 h-11" style={{ gridTemplateColumns: '100px 1fr 1fr 1fr' }}>
                <div className="text-[11px] flex items-center font-medium" style={{ opacity: 0.45 }}>Sales</div>
                <div className="heatmap-cell heatmap-on-track">On Track</div>
                <div className="heatmap-cell heatmap-delayed">Delayed</div>
                <div className="heatmap-cell heatmap-critical">Critical</div>
              </div>
            </div>
          </GlassCard>


          {/* Bottom Row: Charts — use fixed height instead of flex to ensure Recharts renders */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* QoQ Trends */}
            <GlassCard className="p-6" gradient>
              <h3 className="text-sm font-medium text-white mb-4">QoQ Progress Trends</h3>
              <div className="flex items-center justify-center gap-3 text-[10px] mb-4">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary"></span> Engineering</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-teal-400"></span> Marketing</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400"></span> Sales</span>
              </div>
              <div className="w-full h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                    <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', borderRadius: '8px'}} />
                    <Line type="monotone" dataKey="Engineering" stroke="#3b82f6" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Marketing" stroke="#2dd4bf" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Sales" stroke="#fbbf24" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="HR" stroke="#f43f5e" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Operations" stroke="#a855f7" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            {/* Achievement Distribution */}
            <GlassCard className="p-6" gradient>
              <h3 className="text-sm font-medium text-white mb-4">Achievement Distribution</h3>
              <div className="flex flex-col items-center justify-center gap-1 text-[10px] mb-2">
                <span className="flex items-center gap-1 text-muted-foreground"><span className="w-2 h-2 rounded-full bg-primary"></span> Goal Weightage vs. Actual</span>
                <span className="flex items-center gap-1 text-muted-foreground"><span className="w-4 h-[2px] bg-teal-400"></span> Actual Completion</span>
              </div>
              <div className="w-full h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="65%" data={distributionData?.byThrustArea?.map(d => ({ subject: d.area, A: d.count * 10, B: d.count * 8, fullMark: 100 })) || []}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Target" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                    <Radar name="Actual" dataKey="B" stroke="#2dd4bf" fill="transparent" strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            {/* Goal Status Breakdown */}
            <GlassCard className="p-6" gradient>
              <h3 className="text-sm font-medium text-white mb-4">Goal Status Breakdown</h3>
              <div className="flex justify-center gap-4 text-[10px] mb-4">
                <div className="flex flex-col gap-1">
                  <span className="flex items-center gap-1 text-muted-foreground"><span className="w-2 h-2 rounded-full bg-primary"></span> Completed</span>
                  <span className="flex items-center gap-1 text-muted-foreground"><span className="w-2 h-2 rounded-full bg-rose-400"></span> At Risk</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="flex items-center gap-1 text-muted-foreground"><span className="w-2 h-2 rounded-full bg-teal-400"></span> On Track</span>
                </div>
              </div>
              <div className="w-full h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', borderRadius: '8px'}} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </div>

        </div>

        {/* Right Sidebar: AI Chatbot */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 h-[calc(100vh-180px)]">
            <AIAssistantDock insights={insights} onAIResponse={handleAIUpdate} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsDashboard() {
  return (
    <Suspense fallback={
      <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <p className="text-sm text-muted-foreground animate-pulse">Syncing advanced organization intelligence...</p>
      </div>
    }>
      <AnalyticsDashboardContent />
    </Suspense>
  );
}
