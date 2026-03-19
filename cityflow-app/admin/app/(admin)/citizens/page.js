'use client';
import { useState } from 'react';
import { useApp } from '@/lib/AppContext';
import { Card, Button } from '@/components/ui';
import { User, X, Loader2, Search, Trash2, Edit } from 'lucide-react';

export default function CitizensPage() {
  const { citizens, refreshCitizens, editUser, deleteUser } = useApp();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '', phone: '', ward: 'Ward 1' });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const filtered = citizens.filter(u => {
    const q = search.toLowerCase();
    return !q || (u.full_name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q) || (u.ward || '').toLowerCase().includes(q);
  });

  const handleEdit = async (e) => {
    e.preventDefault();
    setFormLoading(true); setFormError('');
    try {
      await editUser(selected.id, form);
      await refreshCitizens();
      setShowEditModal(false);
      setSelected(null);
    } catch (e) {
      setFormError(e.message || 'Failed to update user');
    } finally { setFormLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this citizen account? This will remove all their personal data.')) return;
    try {
      await deleteUser(id);
      await refreshCitizens();
      setSelected(null);
    } catch (e) {
       alert(e.message || 'Failed to delete');
    }
  };

  const openEdit = (u) => {
    setForm({
      first_name: u.first_name || '',
      last_name: u.last_name || '',
      email: u.email || '',
      password: '',
      phone: u.phone || '',
      ward: u.ward || 'Ward 1',
    });
    setShowEditModal(true);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manage Citizens</h2>
          <p className="text-gray-500 text-sm mt-1">{filtered.length} registered citizens</p>
        </div>
      </div>

      <div className="flex gap-3 items-center">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 flex-1 max-w-md shadow-sm">
          <Search size={16} className="text-gray-400" />
          <input type="text" placeholder="Search by name, email or ward..." value={search} onChange={e => setSearch(e.target.value)}
            className="bg-transparent text-sm text-gray-700 outline-none w-full font-medium" />
        </div>
      </div>

      <Card className="overflow-hidden border-slate-100 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['ID', 'Name', 'Contact', 'Ward', 'Joined', ''].map(h => (
                  <th key={h} className="text-left px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer group" onClick={() => setSelected(u)}>
                  <td className="px-6 py-4 text-blue-600 font-bold text-xs">{u.display_id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 font-bold text-xs">
                        {u.first_name?.[0]}{u.last_name?.[0]}
                      </div>
                      <p className="font-bold text-gray-900">{u.full_name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 font-medium">
                    <p>{u.email}</p>
                    <p className="text-[10px]">{u.phone}</p>
                  </td>
                  <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-600 uppercase">{u.ward || 'General'}</span></td>
                  <td className="px-6 py-4 text-gray-400 text-xs font-medium">
                    {u.joined_date ? new Date(u.joined_date).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td className="px-6 py-4 text-right">
                     <button className="text-blue-600 font-bold text-xs hover:underline opacity-0 group-hover:opacity-100 transition-opacity">Manage</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center py-20 text-slate-300 font-medium text-sm">No citizens found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Detail & Manage Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <Card className="w-full max-w-md p-8 animate-fadeIn shadow-2xl !rounded-[32px]" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
                  <User size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900">{selected.full_name}</h3>
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">{selected.display_id}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X size={20} /></button>
            </div>

            <div className="space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Ward</p><p className="font-bold text-gray-900">{selected.ward || '—'}</p></div>
                  <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Phone</p><p className="font-bold text-gray-900">{selected.phone || '—'}</p></div>
               </div>
               <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email address</p><p className="font-bold text-gray-900 underline decoration-blue-200">{selected.email}</p></div>
            </div>

            <div className="flex gap-3 mt-10">
               <Button className="flex-1 !rounded-[20px] py-6 gap-2" variant="outline" onClick={() => openEdit(selected)}>
                 <Edit size={16} /> Edit Login
               </Button>
               <Button className="flex-1 !rounded-[20px] py-6 gap-2 border-red-100 text-red-500 hover:bg-red-50" variant="outline" onClick={() => handleDelete(selected.id)}>
                 <Trash2 size={16} /> Delete User
               </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowEditModal(false)}>
          <Card className="w-full max-w-md p-8 animate-fadeIn shadow-2xl !rounded-[32px]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black text-gray-900">Edit Login Credentials</h3>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X size={20} /></button>
            </div>
            {formError && <div className="bg-red-50 text-red-600 text-[11px] font-bold p-4 rounded-2xl mb-6">{formError}</div>}
            
            <form onSubmit={handleEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">First Name</label>
                  <input type="text" value={form.first_name} onChange={e => setForm(p=>({...p, first_name: e.target.value}))} required
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-sm font-bold resize-none outline-none focus:border-blue-500 transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Last Name</label>
                  <input type="text" value={form.last_name} onChange={e => setForm(p=>({...p, last_name: e.target.value}))} required
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-sm font-bold resize-none outline-none focus:border-blue-500 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Email Address</label>
                <input type="email" value={form.email} onChange={e => setForm(p=>({...p, email: e.target.value}))} required
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-sm font-bold resize-none outline-none focus:border-blue-500 transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">New Password (optional)</label>
                <input type="password" value={form.password} onChange={e => setForm(p=>({...p, password: e.target.value}))} placeholder="Leave blank to keep current"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-sm font-bold resize-none outline-none focus:border-blue-500 transition-all" />
              </div>

              <div className="flex gap-3 pt-6">
                <Button type="submit" className="flex-1 !rounded-[20px] py-6" disabled={formLoading}>
                  {formLoading ? <Loader2 size={16} className="animate-spin" /> : 'Save Modifications'}
                </Button>
                <Button variant="outline" type="button" className="!rounded-[20px] py-6" onClick={() => setShowEditModal(false)}>Cancel</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
