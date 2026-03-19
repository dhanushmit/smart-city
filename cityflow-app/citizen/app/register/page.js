'use client';
import { useState } from 'react';
import { apiRegister, setTokens } from '@/lib/api';
import { useCitizen } from '@/lib/CitizenContext';
import { useRouter } from 'next/navigation';
import { Shield, Loader2, ArrowLeft, Mail, Lock, User, MapPin } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  const { user } = useCitizen();
  const router = useRouter();
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '', ward: 'Ward 1' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) { router.replace('/dashboard'); return null; }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await apiRegister({ ...form, username: form.email.split('@')[0] });
      setTokens(data.access, data.refresh);
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-40 bg-blue-100/50 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 p-40 bg-blue-50 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="w-full max-w-lg relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-blue-600 transition-colors mb-8">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="glass-card"
        >
          <div className="text-center mb-10">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create your Account</h1>
            <p className="text-gray-500 text-sm mt-1 font-medium">Join 12,000+ citizens in Tamilnadu</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-2xl px-4 py-3 mb-6 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider ml-1">First Name</label>
                <div className="relative group">
                  <input type="text" value={form.first_name} onChange={e => setForm(p=>({...p, first_name: e.target.value}))} placeholder="Rajesh" required
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-12 py-4 text-sm text-gray-800 outline-none focus:border-blue-500 focus:bg-white transition-all font-medium" />
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider ml-1">Last Name</label>
                <div className="relative group">
                  <input type="text" value={form.last_name} onChange={e => setForm(p=>({...p, last_name: e.target.value}))} placeholder="Kumar" required
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-12 py-4 text-sm text-gray-800 outline-none focus:border-blue-500 focus:bg-white transition-all font-medium" />
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative group">
                <input type="email" value={form.email} onChange={e => setForm(p=>({...p, email: e.target.value}))} placeholder="name@example.com" required
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-12 py-4 text-sm text-gray-800 outline-none focus:border-blue-500 focus:bg-white transition-all font-medium" />
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider ml-1">Your Ward</label>
              <div className="relative group">
                <select value={form.ward} onChange={e => setForm(p=>({...p, ward: e.target.value}))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-12 py-4 text-sm text-gray-800 outline-none focus:border-blue-500 focus:bg-white transition-all font-medium appearance-none">
                  {['Ward 1', 'Ward 2', 'Ward 3', 'Ward 4', 'Ward 5', 'Ward 6', 'Ward 7', 'Ward 8'].map(w => <option key={w}>{w}</option>)}
                </select>
                <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider ml-1">Password</label>
              <div className="relative group">
                <input type="password" value={form.password} onChange={e => setForm(p=>({...p, password: e.target.value}))} placeholder="••••••••" required
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-12 py-4 text-sm text-gray-800 outline-none focus:border-blue-500 focus:bg-white transition-all font-medium" />
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-60 flex items-center justify-center gap-2 py-4 shadow-blue-200 text-base"
            >
              {loading ? <><Loader2 size={18} className="animate-spin" /> Creating account...</> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm font-semibold text-gray-500 mt-8">
            Already have an account? <Link href="/login" className="text-blue-600 hover:text-blue-700">Sign in instead</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
