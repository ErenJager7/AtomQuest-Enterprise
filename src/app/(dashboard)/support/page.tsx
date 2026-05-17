"use client";

import { GlassCard } from "@/components/glass/GlassCard";
import { HelpCircle, Book, MessageCircle, FileText, ExternalLink, ChevronRight } from "lucide-react";

export default function SupportPage() {
  const faqs = [
    { q: "How do I update my OKR progress?", a: "Navigate to your Dashboard, click the 'Update' button next to your active goal, and enter the new value." },
    { q: "Can I change my goal targets mid-cycle?", a: "Targets are locked once approved. You must request a formal revision from your manager." },
    { q: "How is the overall performance score calculated?", a: "It is a weighted average of all your active goals, taking into account their individual completion percentages." },
    { q: "What does 'At Risk' mean?", a: "A goal is automatically flagged as 'At Risk' if it falls behind the expected linear progression for the current cycle phase." }
  ];

  const resources = [
    { title: "Platform Onboarding Guide", icon: Book, desc: "Step-by-step tutorial for new employees." },
    { title: "OKR Best Practices", icon: FileText, desc: "Learn how to write effective, measurable goals." },
    { title: "API Documentation", icon: ExternalLink, desc: "For developers integrating with AtomQuest." }
  ];

  return (
    <div className="max-w-[1200px] mx-auto pb-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Support & Documentation</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="p-6">
            <h2 className="text-lg font-medium text-white mb-6 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-colors cursor-pointer group">
                  <h3 className="text-sm font-medium text-white mb-2 flex items-center justify-between">
                    {faq.q}
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-white transition-colors" />
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h2 className="text-lg font-medium text-white mb-6">Knowledge Base</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {resources.map((res, i) => (
                <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary/50 transition-colors cursor-pointer group">
                  <res.icon className="w-6 h-6 text-primary mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="text-sm font-medium text-white mb-1">{res.title}</h3>
                  <p className="text-xs text-muted-foreground">{res.desc}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <GlassCard className="p-6 text-center" gradient>
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
              <MessageCircle className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-lg font-medium text-white mb-2">Need direct help?</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Our enterprise support team is available 24/7 to assist you with platform issues.
            </p>
            <button className="w-full py-3 bg-white hover:bg-white/90 text-[#030712] rounded-xl text-sm font-semibold transition-all">
              Open Support Ticket
            </button>
            <p className="text-[10px] text-muted-foreground mt-4 uppercase tracking-widest">Average response: 15 mins</p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
