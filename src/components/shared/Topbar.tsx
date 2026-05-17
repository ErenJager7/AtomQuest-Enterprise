// @ts-nocheck
"use client";

import { useAuth } from "@/lib/auth-context";
import { Search, Bell, ChevronDown, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

export function Topbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout } = useAuth();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const getGreeting = () => {
    if (typeof window === "undefined") return "Hello";
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "☀️ Good Morning";
    if (hour >= 12 && hour < 17) return "🌤️ Good Afternoon";
    if (hour >= 17 && hour < 21) return "🌆 Good Evening";
    return "🌙 Good Night";
  };
  const greeting = getGreeting();

  useEffect(() => {
    if (user) {
      fetch(`/api/notifications?userId=${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setNotifications(data);
            setUnreadCount(data.filter((n: any) => !n.isRead).length);
          } else {
            setNotifications([]);
            setUnreadCount(0);
          }
        })
        .catch(() => {
          setNotifications([]);
          setUnreadCount(0);
        });
    }
  }, [user]);

  const markAllAsRead = async () => {
    if (!user) return;
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, action: 'MARK_ALL_READ' }),
    });
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const roleColors = {
    ADMIN: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    MANAGER: "bg-primary/10 text-primary border-primary/20",
    EMPLOYEE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  };

  return (
    <header className="h-16 border-b border-white/5 bg-[#030712]/50 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-30">
      <div className="flex-1 max-w-xl flex items-center gap-4">
        <span className="text-xs font-semibold text-violet-300 bg-violet-500/10 border border-violet-500/20 px-3 py-1.5 rounded-xl shrink-0">
          {greeting}
        </span>
        <div className="relative group flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            defaultValue={searchParams.get("q") || ""}
            onChange={(e) => {
              const params = new URLSearchParams(searchParams.toString());
              if (e.target.value) {
                params.set("q", e.target.value);
              } else {
                params.delete("q");
              }
              router.replace(`?${params.toString()}`);
            }}
            placeholder="Search goals, team members, or reports..." 
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-muted-foreground focus:outline-none focus:border-primary/50 focus:bg-white/[0.08] transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all relative"
          >
            <Bell className="w-4 h-4 text-muted-foreground" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-[10px] font-bold text-white rounded-full flex items-center justify-center border-2 border-[#030712]">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {isNotificationsOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-96 bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-violet-500/20 shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden"
              >
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Notifications</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">{unreadCount} unread items</p>
                  </div>
                  <button 
                    onClick={markAllAsRead}
                    className="text-[10px] font-medium text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    Mark all as read
                  </button>
                </div>
                <div className="max-h-[350px] overflow-y-auto custom-scrollbar divide-y divide-white/5">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div key={n.id} className={cn("p-4 hover:bg-white/[0.02] transition-colors flex items-start gap-3 relative", !n.isRead && "bg-violet-500/5")}>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white font-bold text-xs">
                          {n.title.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-0.5">
                            <span className="text-xs font-semibold text-white truncate pr-2">{n.title}</span>
                            <span className="text-[9px] text-muted-foreground shrink-0">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-relaxed break-words">{n.message}</p>
                          {!n.isRead && (
                            <div className="flex gap-2 mt-2">
                              <button className="px-2 py-0.5 bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-md text-[9px] font-medium hover:bg-violet-500/20 transition-all">
                                Dismiss
                              </button>
                            </div>
                          )}
                        </div>
                        {!n.isRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse shrink-0 self-center" />
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <Bell className="w-8 h-8 text-white/10 mx-auto mb-2 animate-bounce-slow" />
                      <p className="text-xs text-muted-foreground">No new notifications</p>
                    </div>
                  )}
                </div>
                <div className="p-3 bg-white/[0.02] text-center border-t border-white/5">
                  <button className="text-xs text-muted-foreground hover:text-white font-medium">View all activity</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile Dropdown */}
        <div className="flex items-center gap-4 pl-6 border-l border-white/10 relative">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-white leading-none mb-1">{user?.name || "Guest"}</p>
            <div className="flex items-center gap-2 justify-end">
              <span className={cn(
                "text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider",
                roleColors[user?.role || "EMPLOYEE"]
              )}>
                {user?.role || "EMPLOYEE"}
              </span>
              <p className="text-[10px] text-muted-foreground font-medium">{user?.jobTitle || "AtomQuest User"}</p>
            </div>
          </div>
          
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 group p-1 pr-2 rounded-xl hover:bg-white/5 transition-all border border-transparent hover:border-white/5"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary/20">
              {user?.name?.split(' ').map((n: string) => n[0]).join('') || "U"}
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-white transition-colors" />
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 top-14 w-64 bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-violet-500/20 shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden"
              >
                <div className="p-4 border-b border-white/5">
                  <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
                <div className="p-2">
                  <button onClick={() => router.push('/settings')} className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                    Account Settings
                  </button>
                  <button onClick={() => router.push('/settings?tab=security')} className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                    Change Password
                  </button>
                </div>
                <div className="p-2 border-t border-white/5">
                  <button onClick={() => { setIsProfileOpen(false); logout(); }} className="w-full text-left px-4 py-2 text-sm text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors flex items-center justify-between">
                    <span>Log out</span>
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
