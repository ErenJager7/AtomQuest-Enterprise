// @ts-nocheck
"use client";

import { GlassCard } from "@/components/glass/GlassCard";
import { Settings, User, Bell, Shield, Palette, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useState, useEffect } from "react";

export default function SettingsClient() {
  const { user } = useAuth();
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [slackNotifs, setSlackNotifs] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return !document.documentElement.classList.contains("light-theme");
    }
    return true;
  });
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.remove("light-theme");
    } else {
      document.documentElement.classList.add("light-theme");
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          name: formData.name,
          email: formData.email,
        }),
      });
      if (res.ok) {
        const updatedUser = await res.json();
        // Update local storage
        const currentData = JSON.parse(localStorage.getItem('atomquest_user') || '{}');
        localStorage.setItem('atomquest_user', JSON.stringify({ ...currentData, name: updatedUser.name, email: updatedUser.email }));
        // Trigger a reload to sync the auth context naturally
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto pb-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Platform Settings</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 space-y-2">
          {[
            { id: "account", label: "Account Profile", icon: User },
            { id: "notifications", label: "Notifications", icon: Bell },
            { id: "appearance", label: "Appearance", icon: Palette },
            { id: "security", label: "Security & Access", icon: Shield },
          ].map((item, idx) => (
            <button key={item.id} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${idx === 0 ? "bg-primary/20 text-white border border-primary/30" : "text-muted-foreground hover:bg-white/5 hover:text-white"}`}>
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>

        <div className="col-span-1 md:col-span-2 space-y-6">
          <GlassCard className="p-6">
            <h2 className="text-lg font-medium text-white mb-6">Profile Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Full Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50" 
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Email Address</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50" 
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Role / Job Title</label>
                <div className="flex items-center gap-3">
                  <span className="bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-lg text-xs font-bold tracking-wider">{user?.role || "EMPLOYEE"}</span>
                  <span className="text-sm text-muted-foreground">{user?.jobTitle || "N/A"}</span>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-white/10 flex justify-end">
              <button 
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="px-5 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Changes
              </button>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h2 className="text-lg font-medium text-white mb-6">Preferences</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-white">Email Notifications</h4>
                  <p className="text-xs text-muted-foreground mt-1">Receive daily digests and goal updates via email.</p>
                </div>
                <button onClick={() => setEmailNotifs(!emailNotifs)} className={`w-11 h-6 rounded-full transition-colors relative ${emailNotifs ? "bg-primary" : "bg-white/10"}`}>
                  <span className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full transition-transform ${emailNotifs ? "left-6" : "left-1"}`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-white">Slack Integration</h4>
                  <p className="text-xs text-muted-foreground mt-1">Send approval requests directly to Slack.</p>
                </div>
                <button onClick={() => setSlackNotifs(!slackNotifs)} className={`w-11 h-6 rounded-full transition-colors relative ${slackNotifs ? "bg-primary" : "bg-white/10"}`}>
                  <span className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full transition-transform ${slackNotifs ? "left-6" : "left-1"}`} />
                </button>
              </div>
              <div className="flex items-center justify-between pt-6 border-t border-white/10">
                <div>
                  <h4 className="text-sm font-medium text-white">Dark Mode</h4>
                  <p className="text-xs text-muted-foreground mt-1">AtomQuest is natively built for dark mode.</p>
                </div>
                <button onClick={toggleTheme} className={`w-11 h-6 rounded-full transition-colors relative ${darkMode ? "bg-primary" : "bg-white/10"}`}>
                  <span className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full transition-transform ${darkMode ? "left-6" : "left-1"}`} />
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
