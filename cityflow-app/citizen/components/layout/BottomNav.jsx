'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, AlertCircle, Trash2, Radio, User, Plus, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const items = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/feed', icon: Radio, label: 'Feed' },
  { to: '/report', icon: Plus, label: 'Report', primary: true },
  { to: '/issues', icon: AlertCircle, label: 'Issues' },
  { to: '/profile', icon: User, label: 'Me' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 w-full z-[100] lg:hidden pointer-events-none">
       <div className="mx-4 mb-6 p-2 bg-black/90 backdrop-blur-3xl rounded-[32px] flex items-center justify-between shadow-2xl pointer-events-auto border border-white/10 overflow-visible">
          {items.map(({ to, icon: Icon, label, primary }) => {
            const active = pathname === to;
            
            if (primary) return (
              <Link key={to} href={to} className="relative -top-6">
                 <motion.div
                   whileHover={{ scale: 1.1 }}
                   whileTap={{ scale: 0.9 }}
                   className="w-16 h-16 bg-blue-600 rounded-[24px] flex items-center justify-center text-white shadow-xl shadow-blue-500/40 border-4 border-black"
                 >
                    <Icon size={32} strokeWidth={3} />
                 </motion.div>
              </Link>
            );

            return (
              <Link key={to} href={to} className="flex-1 flex flex-col items-center justify-center gap-1 min-h-[56px] relative group">
                 <motion.div 
                   initial={false}
                   animate={{ 
                     scale: active ? 1.1 : 1,
                     color: active ? '#3b82f6' : '#94a3b8' 
                   }}
                   className={`p-2 rounded-2xl relative transition-colors`}
                 >
                    <Icon size={22} strokeWidth={active ? 2.5 : 2} />
                    {active && (
                       <motion.div 
                         layoutId="bottom-nav-active"
                         className="absolute inset-0 bg-blue-500/10 rounded-2xl -z-10"
                         transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                       />
                    )}
                 </motion.div>
                 {active && (
                    <motion.span 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[8px] font-black text-blue-500 uppercase tracking-widest absolute -bottom-1"
                    >
                       {label}
                    </motion.span>
                 )}
              </Link>
            );
          })}
       </div>
    </nav>
  );
}
