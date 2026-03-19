'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui';
import { apiGetWardAnalytics, apiGetCategoryTrend, apiGetResolutionTrend } from '@/lib/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';

const PIE_COLORS = ['#2563eb', '#0ea5e9', '#f59e0b', '#16a34a', '#8b5cf6', '#ec4899'];

export default function ReportsPage() {
  const [wardData, setWardData] = useState([]);
  const [catTrend, setCatTrend] = useState([]);
  const [resTrend, setResTrend] = useState([]);

  useEffect(() => {
    apiGetWardAnalytics().then(d => setWardData(Array.isArray(d) ? d : [])).catch(() => {});
    apiGetCategoryTrend().then(d => setCatTrend(Array.isArray(d) ? d : [])).catch(() => {});
    apiGetResolutionTrend().then(d => setResTrend(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const catTotals = {};
  catTrend.forEach(row => {
    ['Road', 'Water', 'Electricity', 'Garbage', 'Traffic', 'Public Facilities'].forEach(c => {
      catTotals[c] = (catTotals[c] || 0) + (row[c] || 0);
    });
  });
  const pieData = Object.entries(catTotals).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
        <p className="text-gray-500 text-sm mt-1">Comprehensive city management insights</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Issues by Category (Trend)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={catTrend} barSize={7} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11 }} />
              <Bar dataKey="Road" fill="#2563eb" radius={[2, 2, 0, 0]} />
              <Bar dataKey="Water" fill="#0ea5e9" radius={[2, 2, 0, 0]} />
              <Bar dataKey="Electricity" fill="#f59e0b" radius={[2, 2, 0, 0]} />
              <Bar dataKey="Garbage" fill="#16a34a" radius={[2, 2, 0, 0]} />
              <Bar dataKey="Traffic" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Category Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11 }} />
              <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Average Resolution Time (Hours)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={resTrend}>
            <defs>
              <linearGradient id="resGrad2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11 }} />
            <Area type="monotone" dataKey="avgHours" stroke="#2563eb" strokeWidth={2} fill="url(#resGrad2)" name="Avg Hours" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Ward Performance</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={wardData.map(w => ({ name: w.id, Resolved: w.resolved, Pending: w.pending }))} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11 }} />
            <Bar dataKey="Resolved" fill="#16a34a" radius={[2, 2, 0, 0]} barSize={14} />
            <Bar dataKey="Pending" fill="#f59e0b" radius={[2, 2, 0, 0]} barSize={14} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
