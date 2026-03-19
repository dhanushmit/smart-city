'use client';
import { useApp } from '@/lib/AppContext';
import { Card } from '@/components/ui';
import { MapPin } from 'lucide-react';
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="bg-gradient-to-br from-blue-50 to-slate-100 rounded-xl h-[480px] w-full border border-gray-200 flex flex-col items-center justify-center animate-pulse">
       <MapPin size={48} className="text-blue-300 mx-auto mb-2" />
       <p className="font-medium text-gray-500">Loading Satellite Map Engine...</p>
    </div>
  )
});

const STATUS_COLORS = {
  Submitted: '#94a3b8',
  Assigned: '#2563eb',
  'In Progress': '#f59e0b',
  Resolved: '#16a34a',
  Closed: '#64748b',
};

export default function MapPage() {
  const { issues } = useApp();
  const mappedIssues = issues.filter(i => i.location_lat && i.location_lng);

  return (
    <div className="space-y-5 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Issue Map</h2>
        <p className="text-gray-500 text-sm mt-1">{mappedIssues.length} issues with location data</p>
      </div>

      <div className="grid grid-cols-5 gap-2 text-xs flex-wrap">
        {Object.entries(STATUS_COLORS).map(([s, c]) => (
          <div key={s} className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-lg shadow-sm border border-gray-100">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c }} />
            <span className="text-gray-600">{s}</span>
          </div>
        ))}
      </div>


      <Card className="p-1">
        <div className="rounded-xl h-[480px] relative overflow-hidden border border-gray-200">
          <MapComponent mappedIssues={mappedIssues} />
        </div>
      </Card>

      {/* Issues list with location */}
      <Card>
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800">Georeferenced Issues</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {mappedIssues.slice(0, 10).map(issue => (
            <div key={issue.id} className="px-5 py-3 flex items-center gap-3 hover:bg-gray-50/50">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: STATUS_COLORS[issue.status] || '#94a3b8' }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{issue.title}</p>
                <p className="text-xs text-gray-400">{issue.display_id} · {issue.ward}</p>
              </div>
              <div className="text-xs text-gray-400 whitespace-nowrap">
                {issue.location_lat?.toFixed(4)}, {issue.location_lng?.toFixed(4)}
              </div>
            </div>
          ))}
          {mappedIssues.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">No issues with location data</p>
          )}
        </div>
      </Card>
    </div>
  );
}
