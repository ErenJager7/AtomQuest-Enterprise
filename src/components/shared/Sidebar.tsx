// @ts-nocheck
"use client";

import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  Settings, 
  LifeBuoy, 
  LogOut, 
  Goal,
  PlusCircle,
  UserPlus,
  BookOpen
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useLayoutEffect, useEffect } from "react";
import { GoalCreateModal } from "../modals/GoalCreateModal";
import { AddEmployeeModal } from "../modals/AddEmployeeModal";

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const [pillStyle, setPillStyle] = useState({ top: 0, height: 0, opacity: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const mainNav = [
    { 
      title: "My Dashboard", 
      href: "/dashboard", 
      icon: LayoutDashboard,
      roles: ["EMPLOYEE", "MANAGER", "ADMIN"]
    },
    { 
      title: "Team Performance", 
      href: "/manager", 
      icon: Users,
      roles: ["MANAGER", "ADMIN"]
    },
    { 
      title: "Organization Intelligence", 
      href: "/admin", 
      icon: Settings,
      roles: ["ADMIN"]
    },
    { 
      title: "Advanced Analytics", 
      href: "/analytics", 
      icon: BarChart3,
      roles: ["EMPLOYEE", "MANAGER", "ADMIN"]
    },
  ];

  const bottomNav = [
    { title: "Documentation", href: "/docs", icon: BookOpen },
    { title: "Support", href: "/support", icon: LifeBuoy },
    { title: "Settings", href: "/settings", icon: Settings },
  ];

  const filteredNav = mounted && user ? mainNav.filter(item => item.roles.includes(user.role)) : [];

  // Measure active nav item to position the sliding pill
  useLayoutEffect(() => {
    if (!navRef.current) return;
    const activeLink = navRef.current.querySelector('[data-active="true"]') as HTMLElement;
    if (activeLink) {
      const navTop = navRef.current.getBoundingClientRect().top;
      const linkRect = activeLink.getBoundingClientRect();
      setPillStyle({
        top: linkRect.top - navTop,
        height: linkRect.height,
        opacity: 1,
      });
    } else {
      setPillStyle(prev => ({ ...prev, opacity: 0 }));
    }
  }, [pathname, filteredNav.length]);

  return (
    <div className="w-64 h-screen border-r border-white/5 bg-[#030712] flex flex-col relative z-20">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
            <Goal className="w-6 h-6 text-primary animate-pulse" />
          </div>
          <div className="relative">
            <h1 className="text-xl font-bold bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 
                           bg-clip-text text-transparent animate-gradient-x
                           drop-shadow-[0_0_15px_rgba(139,92,246,0.35)]
                           group-hover:scale-[1.02] group-hover:drop-shadow-[0_0_25px_rgba(139,92,246,0.6)]
                           transition-all duration-300">
              AtomQuest
            </h1>
            <p className="text-[10px] text-violet-300/60 font-medium uppercase tracking-[0.2em]">Enterprise OKR</p>
          </div>
        </Link>
      </div>

      <div className="px-4 py-2">
        {/* Sliding pill nav */}
        <div className="sidebar-nav-container" ref={navRef}>
          {/* Animated pill */}
          <div
            className="sidebar-pill"
            style={{
              top: pillStyle.top,
              height: pillStyle.height,
              opacity: pillStyle.opacity,
            }}
          />

          <div className="space-y-1 relative z-10">
            {filteredNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  data-active={isActive}
                  className={cn(
                    "relative group/item flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 hover:bg-violet-500/10 hover:translate-x-1",
                    isActive
                      ? "text-white"
                      : "text-muted-foreground hover:text-white"
                  )}
                >
                  {isActive && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500
                                    opacity-20 animate-gradient-x blur-sm" />
                  )}
                  <item.icon className={cn(
                    "w-4 h-4 shrink-0 transition-all duration-300 relative z-10",
                    isActive ? "text-violet-400 scale-110" : "text-muted-foreground group-hover/item:scale-125 group-hover/item:rotate-12"
                  )} />
                  <span className="truncate relative z-10">{item.title}</span>
                  {item.title === "Advanced Analytics" && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-violet-400 rounded-full animate-ping" title="AI-Powered Insights Available" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>


      {/* Action Buttons Based on Role */}
      <div className="px-4 mt-6 space-y-3">
        {mounted && (user?.role === 'EMPLOYEE' || user?.role === 'MANAGER') && (
          <button 
            onClick={() => setIsGoalModalOpen(true)}
            className="relative overflow-hidden w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl text-xs font-bold text-white transition-all duration-300 hover:scale-105 active:scale-95 group shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.6)]"
          >
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700" />
            <PlusCircle className="w-4 h-4 relative z-10 group-hover:rotate-90 transition-transform duration-300" />
            <span className="relative z-10">Create New Goal</span>
          </button>
        )}
        
        {mounted && (user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
          <button 
            onClick={() => setIsEmployeeModalOpen(true)}
            className="relative overflow-hidden w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-xl text-xs font-bold text-white transition-all duration-300 hover:scale-105 active:scale-95 group shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.6)]"
          >
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700" />
            <UserPlus className="w-4 h-4 relative z-10 group-hover:scale-110 transition-transform duration-300" />
            <span className="relative z-10">Add New Employee</span>
          </button>
        )}
      </div>

      <div className="mt-auto p-4 space-y-1">
        {bottomNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-white hover:bg-white/5 transition-all"
          >
            <item.icon className="w-4 h-4" />
            {item.title}
          </Link>
        ))}
        
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all text-left"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>

        <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 relative overflow-hidden group">
          <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-emerald-500/10 opacity-10 blur-xl group-hover:scale-110 transition-transform duration-500" />
          <div className="flex items-center gap-3 mb-3">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                <span className="text-[10px] font-bold text-emerald-400">SYS</span>
              </div>
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
            </div>
            <span className="text-xs font-semibold text-white">System Health</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-[10px]">
              <span className="text-muted-foreground">Compliance</span>
              <span className="text-emerald-400 font-bold">98%</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 animate-pulse" style={{ width: '98%' }} />
            </div>
          </div>
        </div>
      </div>

      <GoalCreateModal 
        isOpen={isGoalModalOpen} 
        onClose={() => setIsGoalModalOpen(false)} 
        onCreated={() => {
          // Trigger refresh if needed
          window.location.reload();
        }}
      />
      
      <AddEmployeeModal 
        isOpen={isEmployeeModalOpen} 
        onClose={() => setIsEmployeeModalOpen(false)} 
        onCreated={() => {
          // Trigger refresh if needed
          window.location.reload();
        }}
      />
    </div>
  );
}
