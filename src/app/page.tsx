"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [fade, setFade] = useState(false);

  useEffect(() => {
    // Start fading out slightly before redirecting
    const fadeTimer = setTimeout(() => {
      setFade(true);
    }, 800);

    const redirectTimer = setTimeout(() => {
      router.push("/auth/login");
    }, 1000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(redirectTimer);
    };
  }, [router]);

  return (
    <div className={`min-h-screen bg-[#020617] flex flex-col items-center justify-center transition-opacity duration-300 ${fade ? 'opacity-0' : 'opacity-100'}`}>
      <div className="text-center space-y-4">
        {/* Animated logo glow */}
        <div className="relative inline-block">
          <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-lg blur opacity-70 animate-pulse" />
          <h1 className="relative text-4xl sm:text-5xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 animate-gradient-x px-4 py-2">
            ATOMQUEST
          </h1>
        </div>
        <p className="text-[10px] tracking-widest text-slate-400 uppercase font-bold animate-pulse">
          ENTERPRISE PERFORMANCE PORTAL
        </p>
      </div>
    </div>
  );
}
