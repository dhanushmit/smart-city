'use client';
import { useApp } from '@/lib/AppContext';
import { Card, StatusBadge, PriorityBadge } from '@/components/ui';
import { ThumbsUp, MessageCircle, MapPin } from 'lucide-react';

export default function FeedPage() {
  const { issues } = useApp();
  const publicIssues = issues.filter(i => i.is_public).slice(0, 20);

  return (
    <div className="space-y-5 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Civic Feed</h2>
        <p className="text-gray-500 text-sm mt-1">Live public issues feed — {publicIssues.length} issues</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {publicIssues.map(issue => (
          <Card key={issue.id} className="p-4 hover:shadow-md transition-shadow">
            {issue.image_url && (
              <img
                src={`http://localhost:5000${issue.image_url}`}
                alt={issue.title}
                className="w-full h-36 object-cover rounded-lg mb-3"
                onError={e => { e.target.style.display = 'none'; }}
              />
            )}
            <div className="flex items-start justify-between mb-2">
              <div className="flex flex-wrap gap-1.5">
                <StatusBadge status={issue.status} />
                <PriorityBadge priority={issue.priority} />
              </div>
              <span className="text-xs text-gray-400">{issue.display_id}</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{issue.title}</h3>
            {issue.description && (
              <p className="text-sm text-gray-500 mb-3 line-clamp-2">{issue.description}</p>
            )}
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
              <MapPin size={12} />
              <span>{issue.location_text || issue.ward}</span>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <ThumbsUp size={13} /> {issue.upvotes || 0}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle size={13} /> {(issue.comments || []).length}
                </span>
              </div>
              <span className="text-xs text-gray-400">
                {new Date(issue.reported_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
              </span>
            </div>
          </Card>
        ))}
        {publicIssues.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400">Loading civic feed...</div>
        )}
      </div>
    </div>
  );
}
