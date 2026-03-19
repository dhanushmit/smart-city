'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui';
import { apiGetWardAnalytics } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function WardsPage() {
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGetWardAnalytics().then(d => { setWards(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const totalIssues = wards.reduce((s, w) => s + (w.totalIssues || 0), 0);
  const totalResolved = wards.reduce((s, w) => s + (w.resolved || 0), 0);
  const totalPending = wards.reduce((s, w) => s + (w.pending || 0), 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Ward Analytics</h2>
        <p className="text-gray-500 text-sm mt-1">Issue distribution and resolution across {wards.length} wards</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Issues', value: totalIssues, color: 'text-blue-600' },
          { label: 'Resolved', value: totalResolved, color: 'text-green-600' },
          { label: 'Pending', value: totalPending, color: 'text-orange-600' },
        ].map(({ label, value, color }) => (
          <Card key={label} className="p-4 text-center">
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Issues Per Ward</h3>
        {loading ? (
          <div className="h-48 flex items-center justify-center text-gray-400 text-sm">Loading...</div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={wards.map(w => ({ name: w.id, Total: w.totalIssues, Resolved: w.resolved, Pending: w.pending }))} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Bar dataKey="Total" fill="#2563eb" radius={[3, 3, 0, 0]} barSize={12} />
              <Bar dataKey="Resolved" fill="#16a34a" radius={[3, 3, 0, 0]} barSize={12} />
              <Bar dataKey="Pending" fill="#f59e0b" radius={[3, 3, 0, 0]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {wards.map(w => {
          const resolvedPct = w.totalIssues > 0 ? Math.round((w.resolved / w.totalIssues) * 100) : 0;
          return (
            <Card key={w.id} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-800">{w.id}</h4>
                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full font-medium">{w.totalIssues} issues</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Resolution Rate</span>
                  <span className="font-semibold text-gray-800">{resolvedPct}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="h-2 rounded-full bg-green-500 transition-all" style={{ width: `${resolvedPct}%` }} />
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-green-600 font-medium">{w.resolved} resolved</span>
                  <span className="text-orange-600 font-medium">{w.pending} pending</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
