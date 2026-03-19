'use client';
import { useState } from 'react';
import { useApp } from '@/lib/AppContext';
import { useRouter } from 'next/navigation';
import { Shield, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { login, user } = useApp();
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] to-[#0f172a] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/20">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">CityFlow Admin</h1>
          <p className="text-blue-300 text-sm mt-1">Tamilnadu Government</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Admin Sign In</h2>
          <p className="text-gray-400 text-sm mb-6">Restricted access — authorised personnel only</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@cityflow.gov.in"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            {/* Quick login hints */}
            <div className="bg-blue-50 rounded-lg px-3 py-2 text-xs text-blue-700">
              <strong>Quick login:</strong> admin@cityflow.gov.in / admin123
            </div>

            <button
              id="login-btn"
              type="submit"
              disabled={loading}
              className="w-full bg-[#1e3a8a] hover:bg-blue-900 text-white font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60 mt-2"
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Signing in...</> : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-blue-400/60 text-xs mt-6">
          CityFlow v2.0 · Next.js + Node.js + SQLite
        </p>
      </div>
    </div>
  );
}
