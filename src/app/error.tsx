'use client';

import { useEffect } from 'react';
import { GlassCard } from '@/components/glass/GlassCard';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In an enterprise app, this would send to Sentry or Datadog
    console.error('AtomQuest App Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#020617] relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-rose-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <GlassCard className="p-8 text-center" gradient>
          <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(244,63,94,0.2)]">
            <AlertTriangle className="w-8 h-8 text-rose-400" />
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">System Interruption</h1>
          <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
            We encountered an unexpected anomaly while connecting to the AtomQuest intelligence matrix. Our systems have logged the event.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => reset()}
              className="w-full py-2.5 px-4 rounded-xl bg-white text-black font-semibold text-sm hover:bg-white/90 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Reinitialize Connection
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full py-2.5 px-4 rounded-xl bg-white/5 text-white font-medium text-sm border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Return to Safety
            </button>
          </div>
          
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 p-4 rounded-lg bg-black/40 border border-rose-500/20 text-left overflow-x-auto text-xs">
              <p className="text-rose-400 font-mono font-medium mb-1">Developer Error Trace:</p>
              <p className="text-muted-foreground font-mono whitespace-pre-wrap">{error.message}</p>
            </div>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
}
