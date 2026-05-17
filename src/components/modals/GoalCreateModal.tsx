// @ts-nocheck
"use client";
import { useState, useEffect } from 'react';
import { X, Loader2, Plus, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';

interface GoalCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const thrustAreas = ['Engineering Excellence', 'Customer Success', 'Growth', 'Infrastructure', 'Quality Assurance', 'Team Growth', 'Innovation', 'Process Optimization'];
const uomOptions = ['Percentage', 'Count', 'Hours', 'Revenue', 'People', 'Score', 'Components'];

export function GoalCreateModal({ isOpen, onClose, onCreated }: GoalCreateModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [existingWeightage, setExistingWeightage] = useState(0);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [form, setForm] = useState({
    title: '', description: '', thrustArea: thrustAreas[0], uom: uomOptions[0],
    targetValue: '', weightage: '', deadline: '',
  });

  useEffect(() => {
    if (isOpen && user) {
      fetch(`/api/goals?employeeId=${user.id}`)
        .then(res => res.json())
        .then(goals => {
          const total = goals.reduce((sum: number, g: { weightage: number }) => sum + g.weightage, 0);
          setExistingWeightage(total);
        });
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const remainingWeightage = 100 - existingWeightage;
  const currentWeightage = Number(form.weightage) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (currentWeightage > remainingWeightage) {
      toast('error', 'Weightage exceeds limit', `Only ${remainingWeightage}% remaining`);
      return;
    }

    setLoading(true);
    const res = await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        targetValue: Number(form.targetValue),
        weightage: Number(form.weightage),
        employeeId: user.id,
        status: 'PENDING_APPROVAL',
      }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      toast('error', 'Failed to create goal', data.error);
      return;
    }

    toast('success', 'Goal created', `"${form.title}" submitted for approval`);
    setForm({ title: '', description: '', thrustArea: thrustAreas[0], uom: uomOptions[0], targetValue: '', weightage: '', deadline: '' });
    onCreated();
    onClose();
  };

  const handleGenerateAI = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/generate-goal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: aiPrompt })
      });
      const data = await res.json();
      if (res.ok) {
        setForm(prev => ({
          ...prev,
          title: data.title || prev.title,
          description: data.description || prev.description,
          thrustArea: data.thrustArea || prev.thrustArea,
          uom: data.uom || prev.uom,
          targetValue: data.targetValue?.toString() || prev.targetValue,
          weightage: Math.min(data.weightage || 20, remainingWeightage).toString(),
        }));
        toast('success', 'Goal Generated', 'Review the AI suggestions below');
        setAiPrompt('');
      } else {
        toast('error', 'Generation Failed', data.error);
      }
    } catch (e) {
      toast('error', 'Generation Failed', 'Network error');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="glass-panel rounded-2xl w-full max-w-xl p-8 relative z-10 border border-white/10 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Create New Goal</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Weightage Budget Bar */}
        <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
          <div className="flex justify-between text-xs mb-2">
            <span className="text-muted-foreground">Weightage Budget</span>
            <span className={currentWeightage > remainingWeightage ? 'text-rose-400' : 'text-emerald-400'}>
              {remainingWeightage - currentWeightage}% remaining
            </span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-primary/60 rounded-full" style={{ width: `${existingWeightage}%` }} />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>Used: {existingWeightage}%</span>
            <span>New: +{currentWeightage}%</span>
            <span>Limit: 100%</span>
          </div>
        </div>

        {/* AI Goal Generator */}
        <div className="mb-6 p-1 rounded-xl bg-gradient-to-r from-primary/20 via-teal-400/20 to-primary/20 p-[1px]">
          <div className="bg-[#0f172a] rounded-xl p-3 flex gap-2 items-center">
            <Sparkles className="w-5 h-5 text-teal-400 shrink-0 ml-2" />
            <input 
              value={aiPrompt} 
              onChange={e => setAiPrompt(e.target.value)} 
              placeholder="Or type a rough idea and let AI write the SMART goal..."
              className="flex-1 bg-transparent border-none focus:outline-none text-sm text-white placeholder-muted-foreground px-2"
              onKeyDown={e => e.key === 'Enter' && !aiLoading && handleGenerateAI()}
            />
            <button 
              type="button"
              onClick={handleGenerateAI}
              disabled={aiLoading || !aiPrompt.trim()}
              className="shrink-0 bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Generate'}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-white mb-1.5 block">Goal Title *</label>
            <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required
              placeholder="e.g., Reduce customer churn by 15%"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-muted-foreground focus:outline-none focus:border-primary/50" />
          </div>
          <div>
            <label className="text-sm font-medium text-white mb-1.5 block">Description</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3}
              placeholder="Describe the goal, expected outcomes, and success criteria..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-muted-foreground focus:outline-none focus:border-primary/50 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-white mb-1.5 block">Thrust Area *</label>
              <select value={form.thrustArea} onChange={e => setForm({...form, thrustArea: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 appearance-none">
                {thrustAreas.map(t => <option key={t} value={t} className="bg-[#0f172a]">{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-white mb-1.5 block">Unit of Measure *</label>
              <select value={form.uom} onChange={e => setForm({...form, uom: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 appearance-none">
                {uomOptions.map(u => <option key={u} value={u} className="bg-[#0f172a]">{u}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-white mb-1.5 block">Target *</label>
              <input type="number" value={form.targetValue} onChange={e => setForm({...form, targetValue: e.target.value})} required min={1}
                placeholder="100" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50" />
            </div>
            <div>
              <label className="text-sm font-medium text-white mb-1.5 block">Weightage (%) *</label>
              <input type="number" value={form.weightage} onChange={e => setForm({...form, weightage: e.target.value})} required min={1} max={remainingWeightage}
                placeholder={`Max ${remainingWeightage}`} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50" />
            </div>
            <div>
              <label className="text-sm font-medium text-white mb-1.5 block">Deadline *</label>
              <input type="date" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Submit for Approval</>}
          </button>
        </form>
      </div>
    </div>
  );
}
