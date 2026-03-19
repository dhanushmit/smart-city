'use client';
import { useState } from 'react';
import { useApp } from '@/lib/AppContext';
import { Card, StatusBadge, Button } from '@/components/ui';
import { Users, Plus, X, Loader2, Search, ChevronDown, Trash2, Edit } from 'lucide-react';
import { apiCreateWorker } from '@/lib/api';

const CATEGORY_OPTIONS = ['Infrastructure', 'Sanitation', 'Water Supply', 'Electrical', 'Traffic Control', 'Maintenance'];
const WARD_OPTIONS = ['Ward 1', 'Ward 2', 'Ward 3', 'Ward 4', 'Ward 5', 'Ward 6', 'Ward 7', 'Ward 8'];

export default function WorkersPage() {
  const { workers, refreshWorkers, editUser, deleteUser } = useApp();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: 'worker123', phone: '', ward: 'Ward 1', category: 'Infrastructure' });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const allCats = ['All', ...CATEGORY_OPTIONS];
  const filtered = workers.filter(w => {
    const q = search.toLowerCase();
    return (
      (catFilter === 'All' || w.category === catFilter) &&
      (!q || (w.full_name || w.name || '').toLowerCase().includes(q) || (w.email || '').toLowerCase().includes(q) || (w.ward || '').toLowerCase().includes(q))
    );
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormLoading(true); setFormError('');
    try {
      await apiCreateWorker({ ...form, username: form.email.split('@')[0] + '_' + Date.now() });
      await refreshWorkers();
      setShowAddModal(false);
      setForm({ first_name: '', last_name: '', email: '', password: 'worker123', phone: '', ward: 'Ward 1', category: 'Infrastructure' });
    } catch (e) {
      setFormError(e.message || 'Failed to create worker');
    } finally { setFormLoading(false); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setFormLoading(true); setFormError('');
    try {
      await editUser(selected.id, form);
      await refreshWorkers();
      setShowEditModal(false);
      setSelected(null);
    } catch (e) {
      setFormError(e.message || 'Failed to update worker');
    } finally { setFormLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this worker? This will unassign their current tasks.')) return;
    try {
      await deleteUser(id);
      await refreshWorkers();
      setSelected(null);
    } catch (e) {
       alert(e.message || 'Failed to delete');
    }
  };

  const openEdit = (worker) => {
    setForm({
      first_name: worker.first_name || '',
      last_name: worker.last_name || '',
      email: worker.email || '',
      password: '', // Leave empty if not changing
      phone: worker.phone || '',
      ward: worker.ward || 'Ward 1',
      category: worker.category || 'Infrastructure'
    });
    setShowEditModal(true);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Workers</h2>
          <p className="text-gray-500 text-sm mt-1">{filtered.length} of {workers.length} workers</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Add Worker
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {CATEGORY_OPTIONS.slice(0, 4).map(cat => {
          const count = workers.filter(w => w.category === cat).length;
          return (
            <Card key={cat} className="p-4">
              <p className="text-2xl font-bold text-gray-900">{count}</p>
              <p className="text-xs text-gray-500 mt-1">{cat}</p>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 flex-1 min-w-[200px] max-w-xs">
          <Search size={15} className="text-gray-400" />
          <input type="text" placeholder="Search workers..." value={search} onChange={e => setSearch(e.target.value)}
            className="bg-transparent text-sm text-gray-700 outline-none w-full" />
        </div>
        <div className="relative">
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
            className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm text-gray-700 outline-none">
            {allCats.map(c => <option key={c}>{c}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2 top-2.5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Workers Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['ID', 'Worker', 'Category', 'Ward', 'Open Tasks', 'Completed', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(w => (
                <tr key={w.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => setSelected(w)}>
                  <td className="px-4 py-3 text-blue-600 font-medium text-xs">{w.display_id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users size={14} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{w.full_name || w.name}</p>
                        <p className="text-xs text-gray-400">{w.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{w.category}</td>
                  <td className="px-4 py-3 text-gray-600">{w.ward}</td>
                  <td className="px-4 py-3">
                    <span className="text-orange-600 font-semibold">{w.open_tasks ?? 0}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-green-600 font-semibold">{w.completed_tasks ?? 0}</span>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status="Active" /></td>
                  <td className="px-4 py-3">
                    <button
                      className="text-xs text-blue-600 hover:underline"
                      onClick={e => { e.stopPropagation(); setSelected(w); }}
                    >View</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="text-center py-10 text-gray-400">No workers found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Worker Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <Card className="w-full max-w-md p-6 animate-fadeIn" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users size={20} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{selected.full_name || selected.name}</h3>
                  <p className="text-xs text-blue-600">{selected.display_id}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                ['Email', selected.email],
                ['Phone', selected.phone || '—'],
                ['Ward', selected.ward || '—'],
                ['Category', selected.category || '—'],
                ['Joined', selected.joined_date ? new Date(selected.joined_date).toLocaleDateString('en-IN') : '—'],
                ['Status', 'Active'],
              ].map(([k, v]) => (
                <div key={k}>
                  <p className="text-xs text-gray-400 font-semibold">{k.toUpperCase()}</p>
                  <p className="text-gray-800 mt-0.5">{v}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-orange-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-orange-600">{selected.open_tasks ?? 0}</p>
                <p className="text-xs text-gray-500">Open Tasks</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-green-600">{selected.completed_tasks ?? 0}</p>
                <p className="text-xs text-gray-500">Completed</p>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
               <Button className="flex-1 gap-2" variant="outline" onClick={() => openEdit(selected)}>
                 <Edit size={14} /> Edit Details
               </Button>
               <Button className="flex-1 gap-2 border-red-200 text-red-600 hover:bg-red-50" variant="outline" onClick={() => handleDelete(selected.id)}>
                 <Trash2 size={14} /> Delete
               </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Edit Worker Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowEditModal(false)}>
          <Card className="w-full max-w-md p-6 animate-fadeIn" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-gray-900">Edit Worker</h3>
              <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X size={18} />
              </button>
            </div>
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2 mb-4">{formError}</div>
            )}
            <form onSubmit={handleEdit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['First Name', 'first_name', 'text', 'Rajesh'],
                  ['Last Name', 'last_name', 'text', 'Kumar'],
                ].map(([label, key, type, placeholder]) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
                    <input type={type} value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                      placeholder={placeholder} required
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
                  </div>
                ))}
              </div>
              {[['Email', 'email', 'email', 'worker@cityflow.gov.in'], ['Phone', 'phone', 'tel', '9800000000']].map(([label, key, type, placeholder]) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
                  <input type={type} value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                    placeholder={placeholder} required={key === 'email'}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">New Password (leave blank to keep current)</label>
                <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Ward', 'ward', WARD_OPTIONS],
                  ['Category', 'category', CATEGORY_OPTIONS],
                ].map(([label, key, options]) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
                    <select value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500">
                      {options.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" className="flex-1" disabled={formLoading}>
                  {formLoading ? <Loader2 size={14} className="animate-spin" /> : <Edit size={14} />} Save Changes
                </Button>
                <Button variant="outline" type="button" onClick={() => setShowEditModal(false)}>Cancel</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Add Worker Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <Card className="w-full max-w-md p-6 animate-fadeIn" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-gray-900">Add New Worker</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X size={18} />
              </button>
            </div>
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2 mb-4">{formError}</div>
            )}
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['First Name', 'first_name', 'text', 'Rajesh'],
                  ['Last Name', 'last_name', 'text', 'Kumar'],
                ].map(([label, key, type, placeholder]) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
                    <input type={type} value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                      placeholder={placeholder} required
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
                  </div>
                ))}
              </div>
              {[['Email', 'email', 'email', 'worker@cityflow.gov.in'], ['Phone', 'phone', 'tel', '9800000000']].map(([label, key, type, placeholder]) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
                  <input type={type} value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                    placeholder={placeholder} required={key === 'email'}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Set Login Password</label>
                <input type="text" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="worker123" required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
                <p className="text-[10px] text-gray-400 mt-1">This will be the worker's initial password.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Ward', 'ward', WARD_OPTIONS],
                  ['Category', 'category', CATEGORY_OPTIONS],
                ].map(([label, key, options]) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
                    <select value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500">
                      {options.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" className="flex-1" disabled={formLoading}>
                  {formLoading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Add Worker
                </Button>
                <Button variant="outline" type="button" onClick={() => setShowAddModal(false)}>Cancel</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
