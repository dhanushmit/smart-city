'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, AlertCircle, Radio, User, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BottomNav() {
  const pathname = usePathname();
  const unreadCount = 2; // Count based on reference image

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
    { to: '/feed', icon: Radio, label: 'Explore' },
    { to: '/issues', icon: AlertCircle, label: 'Alerts', badge: unreadCount },
    { to: '/profile', icon: User, label: 'Profile' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-[100] lg:hidden px-6 pb-6 pointer-events-none">
       <div className="mx-auto max-w-sm bg-white border border-gray-100/50 rounded-[32px] flex items-center justify-around shadow-[0_20px_50px_rgba(0,0,0,0.12)] pointer-events-auto py-3 px-2">
          {navItems.map(({ to, icon: Icon, label, badge }) => {
            const active = pathname === to;
            
            return (
              <Link key={to} href={to} className="flex-1 flex flex-col items-center justify-center gap-1 transition-all relative py-2">
                 <div className="relative">
                    <Icon 
                      size={24} 
                      strokeWidth={active ? 2.5 : 2} 
                      className={active ? 'text-gray-900' : 'text-gray-400'} 
                      fill={active ? 'currentColor' : 'none'}
                    />
                    {badge > 0 && (
                      <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 bg-red-600 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-black text-white shadow-sm">
                        {badge}
                      </span>
                    )}
                 </div>
                 <span className={`text-[10px] tracking-tight transition-colors duration-300 ${active ? 'font-bold text-gray-900' : 'font-medium text-gray-400'}`}>
                    {label}
                 </span>
                 {active && (
                   <motion.div 
                     layoutId="nav-pill-dot"
                     className="absolute -bottom-2 w-1 h-1 bg-gray-900 rounded-full"
                     transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                   />
                 )}
              </Link>
            );
          })}
       </div>
    </nav>
  );
}
