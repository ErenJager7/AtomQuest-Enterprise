// @ts-nocheck
"use client";
import { useState, useEffect } from 'react';
import { X, Loader2, UserPlus } from 'lucide-react';
import { useToast } from '@/lib/toast-context';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function AddEmployeeModal({ isOpen, onClose, onCreated }: AddEmployeeModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [managers, setManagers] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState({
    name: '', email: '', jobTitle: '', departmentId: '', managerId: '', role: 'EMPLOYEE', password: '',
  });

  useEffect(() => {
    if (isOpen) {
      fetch('/api/users').then(r => r.json()).then(users => {
        const mgrs = users.filter((u: { role: string }) => u.role === 'MANAGER' || u.role === 'ADMIN');
        setManagers(mgrs);
        const depts = [...new Set(users.map((u: { department?: { id: string; name: string } }) => u.department).filter(Boolean))];
        const uniqueDepts: { id: string; name: string }[] = [];
        const seen = new Set();
        for (const d of depts) {
          if (d && !seen.has(d.id)) { seen.add(d.id); uniqueDepts.push(d); }
        }
        setDepartments(uniqueDepts);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      toast('error', 'Failed to add employee', data.error);
      return;
    }

    toast('success', 'Employee added', `${form.name} has been added to the organization`);
    setForm({ name: '', email: '', jobTitle: '', departmentId: '', managerId: '', role: 'EMPLOYEE', password: '' });
    onCreated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="glass-panel rounded-2xl w-full max-w-xl p-8 relative z-10 border border-white/10 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Add New Employee</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-white mb-1.5 block">Full Name *</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required
                placeholder="John Doe"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-muted-foreground focus:outline-none focus:border-primary/50" />
            </div>
            <div>
              <label className="text-sm font-medium text-white mb-1.5 block">Email *</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required
                placeholder="john@atomquest.inc"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-muted-foreground focus:outline-none focus:border-primary/50" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-white mb-1.5 block">Job Title *</label>
            <input value={form.jobTitle} onChange={e => setForm({...form, jobTitle: e.target.value})} required
              placeholder="e.g., Software Engineer"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-muted-foreground focus:outline-none focus:border-primary/50" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-white mb-1.5 block">Department *</label>
              <select value={form.departmentId} onChange={e => setForm({...form, departmentId: e.target.value})} required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 appearance-none">
                <option value="" className="bg-[#0f172a]">Select department</option>
                {departments.map(d => <option key={d.id} value={d.id} className="bg-[#0f172a]">{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-white mb-1.5 block">Role *</label>
              <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 appearance-none">
                <option value="EMPLOYEE" className="bg-[#0f172a]">Employee</option>
                <option value="MANAGER" className="bg-[#0f172a]">Manager</option>
                <option value="ADMIN" className="bg-[#0f172a]">Admin</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-white mb-1.5 block">Reporting Manager</label>
              <select value={form.managerId} onChange={e => setForm({...form, managerId: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 appearance-none">
                <option value="" className="bg-[#0f172a]">None</option>
                {managers.map(m => <option key={m.id} value={m.id} className="bg-[#0f172a]">{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-white mb-1.5 block">Temporary Password</label>
              <input value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                placeholder="changeme123"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-muted-foreground focus:outline-none focus:border-primary/50" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><UserPlus className="w-4 h-4" /> Add Employee</>}
          </button>
        </form>
      </div>
    </div>
  );
}
