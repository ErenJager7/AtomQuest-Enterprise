// @ts-nocheck
"use client";
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Goal, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';

const quickAccess = [
  { label: 'Employee', email: 'sarah.j@atomquest.inc', password: 'employee123', color: 'bg-emerald-500' },
  { label: 'Manager', email: 'alex.r@atomquest.inc', password: 'manager123', color: 'bg-primary' },
  { label: 'Admin', email: 'jordan.k@atomquest.inc', password: 'admin123', color: 'bg-violet-500' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    if (!result.success) setError(result.error || 'Login failed');
    setLoading(false);
  };

  const quickLogin = async (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
    setError('');
    setLoading(true);
    const result = await login(email, password);
    if (!result.success) setError(result.error || 'Login failed');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-[#030712] relative overflow-hidden">
      {/* Mesh Gradient BG */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-30%] left-[-20%] w-[60%] h-[60%] rounded-full bg-primary/15 blur-[150px]" />
        <div className="absolute bottom-[-30%] right-[-20%] w-[60%] h-[60%] rounded-full bg-violet-500/10 blur-[150px]" />
        <div className="absolute top-[40%] left-[50%] w-[30%] h-[30%] rounded-full bg-teal-500/8 blur-[120px]" />
      </div>

      {/* Left: Branding Panel */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center items-center relative z-10 p-16">
        <div className="max-w-lg text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Goal className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white tracking-tight mb-4">
            Atom<span className="text-primary">Quest</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Enterprise Performance Intelligence Platform
          </p>
          <div className="grid grid-cols-3 gap-4 text-center mt-12">
            {[
              { value: '1,250', label: 'Active Users' },
              { value: '98.7%', label: 'Goal Completion' },
              { value: '4.9/5', label: 'User Rating' },
            ].map((stat) => (
              <div key={stat.label} className="glass-panel rounded-xl p-4">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Goal className="w-6 h-6 text-primary" />
            </div>
            <span className="text-2xl font-bold text-white">AtomQuest</span>
          </div>

          <div className="glass-panel rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-semibold text-white mb-2">Welcome back</h2>
            <p className="text-sm text-muted-foreground mb-8">Sign in to your AtomQuest account</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm font-medium text-white mb-2 block">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-white mb-2 block">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 px-4 py-2.5 rounded-xl">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Sign In</span> <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>

            {/* Register Link */}
            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <a href="/auth/register" className="text-primary hover:text-primary/80 font-semibold transition-colors">
                  Register here
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
