import { Suspense } from 'react';
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden relative">
      {/* Ambient Orbs — z-index: -1, they sit behind all glass cards */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        {/* Indigo orb — top left */}
        <div
          className="ambient-orb"
          style={{
            width: '55%', height: '55%',
            top: '-15%', left: '-10%',
            background: '#312e81',
          }}
        />
        {/* Dark teal orb — bottom right */}
        <div
          className="ambient-orb"
          style={{
            width: '50%', height: '50%',
            bottom: '-15%', right: '-10%',
            background: '#115e59',
          }}
        />
        {/* Subtle blue accent — centre */}
        <div
          className="ambient-orb"
          style={{
            width: '30%', height: '30%',
            top: '35%', left: '40%',
            background: '#1e3a5f',
            opacity: 0.10,
          }}
        />
      </div>

      {/* Main UI */}
      <div className="flex h-full w-full" style={{ position: 'relative', zIndex: 1 }}>
        <Sidebar />
        <div className="flex-col flex flex-1 overflow-hidden">
          <Suspense fallback={<div className="h-16 border-b border-white/10 bg-transparent flex items-center justify-end px-6 shrink-0" />}>
            <Topbar />
          </Suspense>
          <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

