'use client';
import { useState, useEffect } from 'react';
import { useCitizen } from '@/lib/CitizenContext';
import { useRouter } from 'next/navigation';
import { Shield, Loader2, ArrowLeft, Mail, Lock, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginPage() {
  const { login, user } = useCitizen();
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [waking, setWaking]     = useState(false);

  useEffect(() => {
    // Hidden "morning call" to wake up Render (30s on free tier)
    const wakeUp = async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) return;

      setWaking(true);
      try { 
        await fetch(`${apiUrl}/api/health`); 
      } catch (e) {
        console.warn('Wake-up ping failed', e);
      } finally {
        setTimeout(() => setWaking(false), 2000);
      }
    };
    wakeUp();
  }, []);

  if (user) { router.replace('/dashboard'); return null; }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 p-40 bg-blue-100/50 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 p-40 bg-blue-50 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="w-full max-w-md relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-blue-600 transition-colors mb-8">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card"
        >
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-200">
              <Shield size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Portal Sign In</h1>
            <p className="text-gray-500 text-sm mt-1 font-medium italic">Authorized for Citizens & Workers</p>
          </div>

          <AnimatePresence>
            {waking && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-blue-50 border border-blue-100/50 text-blue-600 text-[10px] font-bold uppercase tracking-widest rounded-xl px-4 py-2.5 mb-6 flex items-center justify-center gap-2"
              >
                <Sparkles size={12} className="animate-pulse" />
                Waking up city server...
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-2xl px-4 py-3 mb-6 font-medium animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative group">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-12 py-4 text-sm text-gray-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all font-medium"
                />
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider ml-1">Security Key</label>
              <div className="relative group">
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-12 py-4 text-sm text-gray-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all font-medium"
                />
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-bold text-gray-400 mb-2 px-1">
              <label className="flex items-center gap-2 cursor-pointer hover:text-gray-600 transition-colors">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-200 text-blue-600 focus:ring-0" /> Remember me
              </label>
              <a href="#" className="text-blue-600 hover:text-blue-700">Forgot password?</a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 py-4 shadow-blue-200 text-base"
            >
              {loading ? <><Loader2 size={18} className="animate-spin" /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm font-semibold text-gray-500 mt-8">
            New to CityFlow? <Link href="/register" className="text-blue-600 hover:text-blue-700">Create an account</Link>
          </p>
        </motion.div>

        <p className="text-center text-xs font-bold text-gray-400 mt-10 uppercase tracking-[0.2em]">
          Designed for Tamilnadu
        </p>
      </div>
    </div>
  );
}
