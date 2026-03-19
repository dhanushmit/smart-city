'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, MapPin, Trash2, Send, Activity, ChevronRight, Menu, X, Users, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useCitizen } from '@/lib/CitizenContext';

const FeatureCard = ({ icon: Icon, title, desc, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    viewport={{ once: true }}
    className="bg-white/80 p-6 rounded-3xl border border-blue-50 hover:border-blue-200 hover:shadow-xl transition-all group"
  >
    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
      <Icon size={24} className="text-blue-600" />
    </div>
    <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
  </motion.div>
);

export default function LandingPage() {
  const { user } = useCitizen();
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <div className="min-h-screen selection:bg-blue-100 selection:text-blue-900">
      {/* Nav */}
      <nav className="fixed top-0 left-0 w-full z-50 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between glass-pill px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Shield size={20} className="text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-gray-900">CityFlow</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600">
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#stats" className="hover:text-blue-600 transition-colors">Impact</a>
            {user ? (
              <Link href="/dashboard" className="btn-primary py-2 px-5 text-xs shadow-blue-100">Dashboard</Link>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login" className="hover:text-blue-600 transition-colors">Sign In</Link>
                <Link href="/register" className="btn-primary py-2 px-5 text-xs shadow-blue-100">Get Started</Link>
              </div>
            )}
          </div>

          <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden text-gray-900">
            {mobileMenu ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-40 pb-20 px-6 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold mb-6 border border-blue-100">
             <Activity size={12} className="animate-pulse" /> Live in Tamilnadu
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-6">
            Your Voice <br /><span className="text-blue-600">Dynamic City</span>
          </h1>
          <p className="text-lg text-gray-500 mb-8 max-w-md leading-relaxed">
            Report civic issues, track real-time garbage collection, and contribute to a smarter Tamilnadu through our data-driven platform.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/register" className="btn-primary flex items-center gap-2 shadow-blue-200">
              Join Thousands <ChevronRight size={18} />
            </Link>
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 overflow-hidden flex items-center justify-center">
                  <Users size={16} className="text-gray-400" />
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-white bg-blue-50 flex items-center justify-center text-[10px] font-bold text-blue-600">
                +12k
              </div>
            </div>
            <p className="text-xs text-gray-400 font-medium">Active citizens helping Tamilnadu shine.</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative"
        >
          <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-200/30 blur-[100px] rounded-full" />
          {/* Dashboard Preview Mockup */}
          <div className="glass-card !p-2 rotate-2 hover:rotate-0 transition-transform duration-500">
            <div className="bg-slate-50 rounded-2xl p-4 overflow-hidden border border-slate-100 h-[400px]">
              <div className="flex items-center justify-between mb-6">
                 <div className="flex gap-1.5"><div className="w-2.5 h-2.5 bg-red-400 rounded-full" /><div className="w-2.5 h-2.5 bg-yellow-400 rounded-full" /><div className="w-2.5 h-2.5 bg-green-400 rounded-full" /></div>
                 <div className="w-32 h-2 bg-slate-200 rounded-full" />
              </div>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl animate-pulse" />
                  <div className="flex-1 space-y-2 pt-1"><div className="w-3/4 h-3 bg-slate-200 rounded-full" /><div className="w-1/2 h-2 bg-slate-100 rounded-full" /></div>
                </div>
                <div className="w-full h-32 bg-slate-100 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300">
                   <Activity size={32} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-16 bg-white rounded-xl shadow-sm border border-slate-100" />
                  <div className="h-16 bg-blue-600 rounded-xl shadow-lg shadow-blue-100" />
                </div>
              </div>
            </div>
          </div>
          {/* Mini float cards */}
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-6 -right-6 glass-pill !px-4 !py-2 flex items-center gap-2 shadow-2xl border-green-100"
          >
            <div className="p-1.5 bg-green-500 rounded-full text-white"><Shield size={10} /></div>
            <span className="text-xs font-bold text-gray-700">Issue Resolved!</span>
          </motion.div>
          <motion.div
            animate={{ x: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-10 -left-10 glass-pill !px-4 !py-3 flex items-center gap-2 shadow-2xl border-blue-100"
          >
            <div className="p-1.5 bg-blue-500 rounded-full text-white"><Trash2 size={10} /></div>
            <span className="text-xs font-bold text-gray-700">Bin Overflow Alert</span>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 bg-slate-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">How we make a difference</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Everything you need to be an active part of your city's growth, all in one seamless application.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard icon={Send} title="Report Local Issues" desc="Broken streetlights, potholes, or water leaks — report them instantly with a photo and location." delay={0.1} />
            <FeatureCard icon={Activity} title="Real-time Tracking" desc="Get status updates as municipal workers are assigned and issues are resolved step-by-step." delay={0.2} />
            <FeatureCard icon={Trash2} title="Smart Sanitation" desc="AI-driven monitoring of garbage bins across the city to ensure timely collection and hygiene." delay={0.3} />
            <FeatureCard icon={Users} title="Community Feed" desc="See and upvote issues in your ward, and see what the corporation is fixing in real-time." delay={0.4} />
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto bg-[#2563EB] rounded-[40px] p-12 md:p-20 relative overflow-hidden text-center shadow-2xl shadow-blue-200">
           <div className="absolute top-0 right-0 p-20 bg-white/10 blur-[100px] rounded-full" />
           <div className="absolute bottom-0 left-0 p-20 bg-blue-900/30 blur-[100px] rounded-full" />
           <motion.h2
             initial={{ opacity: 0, scale: 0.95 }}
             whileInView={{ opacity: 1, scale: 1 }}
             className="text-3xl md:text-5xl font-extrabold text-white mb-6"
           >
             Ready to help Tamilnadu?
           </motion.h2>
           <p className="text-blue-100 max-w-lg mx-auto mb-10 text-lg">
             Create your account today and start reporting issues that matter to your neighborhood.
           </p>
           <div className="flex flex-wrap items-center justify-center gap-4">
             <Link href="/register" className="bg-white text-blue-600 px-10 py-4 rounded-2xl font-bold hover:bg-blue-50 shadow-xl transition-all">Sign Up Now</Link>
             <Link href="/login" className="bg-blue-700/50 text-white border border-white/20 px-10 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all">Back to Sign In</Link>
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
              <Shield size={16} className="text-white" />
            </div>
            <span className="text-base font-bold tracking-tight text-gray-900 uppercase">CityFlow</span>
          </div>
          <p className="text-sm text-gray-400">© 2026 Tamilnadu Government. Built for Citizens.</p>
          <div className="flex gap-6 text-sm text-gray-400 font-medium">
             <a href="#" className="hover:text-blue-600">Privacy</a>
             <a href="#" className="hover:text-blue-600">Terms</a>
             <a href="#" className="hover:text-blue-600">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
