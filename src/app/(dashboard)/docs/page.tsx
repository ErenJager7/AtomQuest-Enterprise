"use client";

import { GlassCard } from "@/components/glass/GlassCard";
import { BookOpen, HelpCircle, Code, Shield, Terminal, ArrowRight } from "lucide-react";

export default function DocsPage() {
  const sections = [
    {
      title: "Getting Started",
      icon: BookOpen,
      items: [
        { name: "Platform Onboarding", desc: "A walkthrough of your first 30 days using AtomQuest to set, track, and align your goals." },
        { name: "Goal Setting Guide", desc: "Learn how to formulate measurable targets, key performance indicators, and cycle weightages." }
      ]
    },
    {
      title: "OKR & Performance Best Practices",
      icon: Shield,
      items: [
        { name: "Writing SMART OKRs", desc: "Ensure your objectives are specific, measurable, achievable, relevant, and time-bound." },
        { name: "Milestone Tracking", desc: "How to break down multi-month objectives into actionable weekly checks to guarantee delivery." }
      ]
    },
    {
      title: "API & Integrations Reference",
      icon: Code,
      items: [
        { name: "Webhook Setup", desc: "Subscribe to goal updates, approvals, and performance telemetry notifications." },
        { name: "GraphQL & REST Endpoints", desc: "Retrieve active performance data, department statistics, and velocity heatmaps programmatically." }
      ]
    }
  ];

  return (
    <div className="max-w-[1200px] mx-auto pb-10 space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-semibold text-white">Platform Documentation</h1>
        <p className="text-sm text-muted-foreground mt-1">Official user manuals, OKR methodologies, and system developer guides.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {sections.map((section, idx) => (
            <GlassCard key={idx} className="p-6 hover:border-violet-500/20 transition-all duration-300">
              <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                <section.icon className="w-5 h-5 text-primary" />
                {section.title}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all cursor-pointer group flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-white group-hover:text-primary transition-colors flex items-center justify-between">
                        {item.name}
                        <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </h3>
                      <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          ))}
        </div>

        <div className="lg:col-span-1 space-y-6">
          <GlassCard className="p-6 relative overflow-hidden group" gradient>
            <div className="absolute right-[-20px] top-[-20px] w-24 h-24 rounded-full bg-primary/10 blur-xl group-hover:scale-110 transition-transform duration-500" />
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-primary animate-pulse" />
              AtomQuest CLI
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              Manage your goals, pull team statistics, and submit check-ins directly from your terminal.
            </p>
            <div className="p-3 bg-black/40 rounded-xl border border-white/5 font-mono text-[10px] text-violet-300 mb-4 select-all">
              npm install -g @atomquest/cli
            </div>
            <button className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-white transition-all flex items-center justify-center gap-2">
              Read CLI Manual
            </button>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              Looking for Support?
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              Can't find what you are looking for in the manuals? Get in touch with our operations support desk.
            </p>
            <a href="/support" className="w-full py-2.5 bg-primary/20 hover:bg-primary/30 border border-primary/30 rounded-xl text-xs font-semibold text-primary transition-all flex items-center justify-center gap-2">
              Visit Support Portal
            </a>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
