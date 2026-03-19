'use client';
import { useState } from 'react';
import { useApp } from '@/lib/AppContext';
import { Card, Button, StatusBadge } from '@/components/ui';
import { Trash2, RefreshCw, Loader2, ChevronDown } from 'lucide-react';

export default function GarbagePage() {
  const { bins, updateBinLevel, refreshBins } = useApp();
  const [wardFilter, setWardFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selected, setSelected] = useState(null);
  const [newFillLevel, setNewFillLevel] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const wards = ['All', ...Array.from(new Set(bins.map(b => b.ward).filter(Boolean))).sort()];
  const statusOptions = ['All', 'Overflow', 'Near Capacity', 'Normal'];

  const filtered = bins.filter(b => {
    const s = b.fill_level >= 90 ? 'Overflow' : b.fill_level >= 70 ? 'Near Capacity' : 'Normal';
    return (wardFilter === 'All' || b.ward === wardFilter) && (statusFilter === 'All' || s === statusFilter);
  });

  const overflow = bins.filter(b => b.fill_level >= 90).length;
  const nearCap = bins.filter(b => b.fill_level >= 70 && b.fill_level < 90).length;
  const normal = bins.filter(b => b.fill_level < 70).length;

  const handleUpdate = async () => {
    if (!selected || newFillLevel === '') return;
    setActionLoading(true);
    try {
      await updateBinLevel(selected.id, parseInt(newFillLevel));
      setSelected(null); setNewFillLevel('');
    } catch (e) {
      alert('Failed to update: ' + e.message);
    } finally { setActionLoading(false); }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try { await refreshBins(); } finally { setRefreshing(false); }
  };

  const getBinColor = (level) => {
    if (level >= 90) return 'bg-red-500';
    if (level >= 70) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getStatusColor = (status) => {
    if (status === 'Overflow') return 'bg-red-100 text-red-700';
    if (status === 'Near Capacity') return 'bg-orange-100 text-orange-700';
    return 'bg-green-100 text-green-700';
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Garbage Monitoring</h2>
          <p className="text-gray-500 text-sm mt-1">{bins.length} bins tracked across all wards</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 border-l-4 border-red-500">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-100 rounded-xl"><Trash2 size={20} className="text-red-600" /></div>
            <div>
              <p className="text-2xl font-bold text-red-600">{overflow}</p>
              <p className="text-xs text-gray-500 font-medium">Overflow</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-orange-500">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-100 rounded-xl"><Trash2 size={20} className="text-orange-600" /></div>
            <div>
              <p className="text-2xl font-bold text-orange-600">{nearCap}</p>
              <p className="text-xs text-gray-500 font-medium">Near Capacity</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-green-500">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-green-100 rounded-xl"><Trash2 size={20} className="text-green-600" /></div>
            <div>
              <p className="text-2xl font-bold text-green-600">{normal}</p>
              <p className="text-xs text-gray-500 font-medium">Normal</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        {[
          { value: wardFilter, setter: setWardFilter, options: wards, label: 'Ward' },
          { value: statusFilter, setter: setStatusFilter, options: statusOptions, label: 'Status' },
        ].map(({ value, setter, options, label }) => (
          <div key={label} className="relative">
            <select value={value} onChange={e => setter(e.target.value)}
              className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm text-gray-700 outline-none shadow-sm">
              {options.map(o => <option key={o}>{o}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-2.5 text-gray-400 pointer-events-none" />
          </div>
        ))}
      </div>

      {/* Bins Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(bin => {
          const status = bin.fill_level >= 90 ? 'Overflow' : bin.fill_level >= 70 ? 'Near Capacity' : 'Normal';
          return (
            <Card key={bin.id} className={`p-4 cursor-pointer hover:shadow-md transition-shadow ${bin.fill_level >= 90 ? 'ring-1 ring-red-200' : ''}`}
              onClick={() => { setSelected(bin); setNewFillLevel(String(bin.fill_level)); }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-gray-700 font-mono">{bin.bin_id}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor(status)}`}>{status}</span>
              </div>
              <p className="text-sm text-gray-600 truncate mb-1">{bin.location_text}</p>
              <p className="text-xs text-gray-400 mb-3">{bin.ward}</p>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Fill Level</span>
                  <span className={`font-bold ${bin.fill_level >= 90 ? 'text-red-600' : bin.fill_level >= 70 ? 'text-orange-600' : 'text-green-600'}`}>
                    {bin.fill_level}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all ${getBinColor(bin.fill_level)}`}
                    style={{ width: `${bin.fill_level}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{bin.fill_level * bin.capacity / 100}L / {bin.capacity}L</span>
                  <span>Last: {new Date(bin.last_collected).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                </div>
              </div>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400">
            {bins.length === 0 ? 'Loading bins...' : 'No bins match filters'}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <Card className="w-full max-w-sm p-6 animate-fadeIn" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold text-gray-900 mb-1">{selected.bin_id}</h3>
            <p className="text-sm text-gray-500 mb-4">{selected.location_text} · {selected.ward}</p>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-600 mb-2">Update Fill Level (%)</label>
              <div className="space-y-2">
                <input
                  type="range" min="0" max="100" value={newFillLevel}
                  onChange={e => setNewFillLevel(e.target.value)}
                  className="w-full accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>0%</span>
                  <span className="font-bold text-gray-800 text-base">{newFillLevel}%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button className="flex-1" onClick={handleUpdate} disabled={actionLoading}>
                {actionLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                Update Level
              </Button>
              <Button variant="outline" onClick={() => setSelected(null)}>Cancel</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
