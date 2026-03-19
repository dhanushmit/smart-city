'use client';
import { useApp } from '@/lib/AppContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const { user, authLoading } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading) {
      if (user) router.replace('/dashboard');
      else router.replace('/login');
    }
  }, [user, authLoading, router]);

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#1e3a8a] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Loading CityFlow...</p>
      </div>
    </div>
  );
}
