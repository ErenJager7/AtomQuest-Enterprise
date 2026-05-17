"use client";

import { GlassCard } from "@/components/glass/GlassCard";
import { mockUsers } from "@/lib/mock-data";
import { Users } from "lucide-react";

export default function TeamPage() {
  return (
    <div className="max-w-[1400px] mx-auto pb-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Team Directory</h1>
      </div>

      <GlassCard className="p-6" gradient>
        <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
          <Users className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-medium text-white">Organization Roster</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockUsers.map((user) => (
            <div key={user.id} className="p-4 bg-white/5 border border-white/10 rounded-xl hover:border-white/20 transition-colors flex items-center gap-4">
               <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                 {user.name.charAt(0)}
               </div>
               <div>
                 <h3 className="font-medium text-white">{user.name}</h3>
                 <p className="text-xs text-muted-foreground">{user.jobTitle}</p>
                 <span className="inline-block mt-1 px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] text-muted-foreground">
                   {user.department?.name || 'Company'}
                 </span>
               </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
