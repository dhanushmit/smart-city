'use client';
import { useState, useEffect } from 'react';
import { useCitizen } from '@/lib/CitizenContext';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import BottomNav from '@/components/layout/BottomNav';

export default function DashboardLayout({ children }) {
  const { user, loading } = useCitizen();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400 text-sm font-medium">Authenticating...</p>
      </div>
    </div>
  );

  if (!user) return null;

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Navbar onOpenSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto pb-24 md:pb-6 p-4 md:p-8">
           {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
