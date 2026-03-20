'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCitizen } from '@/lib/CitizenContext';

export default function LandingPage() {
  const { user } = useCitizen();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
