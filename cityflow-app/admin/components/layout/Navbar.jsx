'use client';
import { useState } from 'react';
import { useApp } from '@/lib/AppContext';
import { Menu, Bell, ChevronDown, LogOut, User } from 'lucide-react';

export default function Navbar({ onOpenSidebar }) {
  const { user, logout, notifications, unreadCount, markNotificationRead } = useApp();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-6 relative z-10">
      {/* Left: Hamburger */}
      <button
        onClick={onOpenSidebar}
        className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
      >
        <Menu size={20} />
      </button>

      {/* Title on mobile */}
      <div className="lg:hidden font-bold text-gray-900 text-sm ml-2">CityFlow</div>

      {/* Right: Notifications + Profile */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifs(!showNotifs); setShowProfile(false); }}
            className="relative p-2 hover:bg-gray-100 rounded-lg text-gray-600"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 animate-fadeIn overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
                <span className="text-xs text-gray-400">{unreadCount} unread</span>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">No notifications</p>
                ) : notifications.map(n => (
                  <button
                    key={n.id}
                    onClick={() => markNotificationRead(n.id)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors ${!n.read ? 'bg-blue-50/50' : ''}`}
                  >
                    <div className="flex items-start gap-2">
                      <span className={`mt-1.5 w-2 h-2 flex-shrink-0 rounded-full ${n.type === 'alert' ? 'bg-red-500' : 'bg-orange-400'}`} />
                      <p className="text-xs text-gray-700 leading-relaxed">{n.text}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => { setShowProfile(!showProfile); setShowNotifs(false); }}
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 bg-[#1e3a8a] rounded-full flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-gray-800">{user?.full_name || user?.username}</p>
              <p className="text-[10px] text-gray-500 capitalize">{user?.role}</p>
            </div>
            <ChevronDown size={14} className="text-gray-400 hidden md:block" />
          </button>

          {showProfile && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 animate-fadeIn overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-800">{user?.full_name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={15} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Close dropdowns on outside click */}
      {(showNotifs || showProfile) && (
        <div
          className="fixed inset-0 z-[-1]"
          onClick={() => { setShowNotifs(false); setShowProfile(false); }}
        />
      )}
    </header>
  );
}
