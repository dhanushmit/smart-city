'use client';
import { useState } from 'react';
import { useApp } from '@/lib/AppContext';
import { Card, Button } from '@/components/ui';
import { User, Lock, Save, Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useApp();
  const [tab, setTab] = useState('profile');
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    ward: user?.ward || '',
    gender: user?.gender || '',
    dob: user?.dob || '',
    street: user?.street || '',
    landmark: user?.landmark || '',
  });
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleProfileSave = async () => {
    setSaving(true); setError(''); setSuccess('');
    try {
      const { getAccessToken } = await import('@/lib/api');
      const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${BASE}/api/auth/profile/`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${getAccessToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to update profile');
      setSuccess('Profile updated successfully!');
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  };

  const handlePasswordSave = async () => {
    if (pwForm.new_password !== pwForm.confirm) { setError('Passwords do not match'); return; }
    setSaving(true); setError(''); setSuccess('');
    try {
      const { getAccessToken } = await import('@/lib/api');
      const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${BASE}/api/auth/change-password/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getAccessToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_password: pwForm.current_password, new_password: pwForm.new_password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to change password');
      setSuccess('Password changed successfully!');
      setPwForm({ current_password: '', new_password: '', confirm: '' });
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-5 animate-fadeIn max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-gray-500 text-sm mt-1">Manage your account and preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {[
          { id: 'profile', icon: User, label: 'Profile' },
          { id: 'security', icon: Lock, label: 'Security' },
        ].map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => { setTab(id); setSuccess(''); setError(''); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${tab === id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* Profile info card */}
      <Card className="p-5">
        <div className="flex items-center gap-4 mb-5 pb-5 border-b border-gray-100">
          <div className="w-16 h-16 bg-[#1e3a8a] rounded-2xl flex items-center justify-center">
            <User size={28} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-lg">{user?.full_name}</p>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium capitalize">{user?.role}</span>
          </div>
        </div>

        {(success || error) && (
          <div className={`mb-4 px-4 py-2.5 rounded-lg text-sm ${success ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
            {success || error}
          </div>
        )}

        {tab === 'profile' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                ['First Name', 'first_name', 'text'],
                ['Last Name', 'last_name', 'text'],
                ['Ward', 'ward', 'text'],
                ['Date of Birth', 'dob', 'date'],
                ['Street', 'street', 'text'],
                ['Landmark', 'landmark', 'text'],
              ].map(([label, key, type]) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
                  <input type={type} value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                </div>
              ))}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Gender</label>
              <select value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500">
                <option value="">— Select —</option>
                {['Male', 'Female', 'Other'].map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleProfileSave} disabled={saving}>
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Profile
              </Button>
            </div>
          </div>
        )}

        {tab === 'security' && (
          <div className="space-y-4">
            {[
              ['Current Password', 'current_password'],
              ['New Password', 'new_password'],
              ['Confirm New Password', 'confirm'],
            ].map(([label, key]) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
                <input type="password" value={pwForm[key]} onChange={e => setPwForm(p => ({ ...p, [key]: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              </div>
            ))}
            <Button onClick={handlePasswordSave} disabled={saving}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />} Change Password
            </Button>
          </div>
        )}
      </Card>

      {/* System Info */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">System Information</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            ['Version', 'CityFlow v2.0'],
            ['Stack', 'Next.js 14 + Node.js Express'],
            ['Database', 'SQLite (better-sqlite3)'],
            ['Auth', 'JWT (jsonwebtoken)'],
            ['API Port', ':5000'],
            ['Admin Port', ':3000'],
          ].map(([k, v]) => (
            <div key={k} className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-400 font-semibold mb-0.5">{k}</p>
              <p className="text-gray-700 text-sm font-medium">{v}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
