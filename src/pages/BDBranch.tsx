import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, BarChart3, CreditCard, LayoutDashboard,
  ArrowLeft, X, Lock, User
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export function BDBranch() {
  const [showAuth, setShowAuth] = useState(false);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    const userIdRegex = /^1\d{7}$/;
    if (userIdRegex.test(userId) && password === 'Dop@1234') {
      window.open('https://dhenkanal-postal-division-interface.vercel.app/', '_blank');
      setShowAuth(false);
      setUserId('');
      setPassword('');
      setError('');
    } else {
      setError('Invalid User ID or Password. User ID must be 8 digits starting with 1.');
    }
  };

  const cards = [
    {
      title: "BD Product Rules/Orders",
      desc: "Business Development Product Rules and Official Orders",
      link: "https://bd-products-orders.vercel.app/",
      color: "bg-postal-red",
      icon: FileText
    },
    {
      title: "BD Reports",
      desc: "Daily and Monthly Business Development Performance Reports",
      link: "#",
      color: "bg-[#009688]", // Teal
      icon: BarChart3
    },
    {
      title: "BNPL Services",
      desc: "Book Now Pay Later Service Management and Guidelines",
      link: "https://bnpl-services.vercel.app/",
      color: "bg-[#7e57c2]", // Purple
      icon: CreditCard
    },
    {
      title: "BD Interface",
      desc: "Internal Business Development Operations Interface",
      link: "https://dhenkanal-postal-division-interface.vercel.app/",
      color: "bg-[#1976d2]", // Blue
      icon: LayoutDashboard
    }
  ];

  return (
    <div className="min-h-screen bg-postal-bg flex flex-col font-sans selection:bg-postal-red selection:text-white">
      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden py-12">
        {/* Watermark Background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
          <img 
            src="https://upload.wikimedia.org/wikipedia/en/thumb/3/32/India_Post.svg/250px-India_Post.svg.png" 
            alt="Watermark" 
            className="w-full max-w-5xl object-contain rotate-12 grayscale"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4">
          <div className="flex items-center gap-2 mb-8">
            <Link to="/" className="p-2 hover:bg-white/50 rounded-full transition-colors text-slate-600">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">BD Branch Portal</h2>
              <p className="text-sm text-slate-500">Business Development Branch Resources & Services</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {cards.map((card, i) => {
              const isInterface = card.title === "BD Interface";
              
              const CardContent = (
                <div className="flex flex-col items-center justify-center h-full gap-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/20 blur-xl rounded-full scale-150 animate-pulse" />
                    <div className="relative bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                      <card.icon className="text-white" size={40} />
                    </div>
                  </div>
                  <div className="text-white space-y-2">
                    <h3 className="text-xl font-black leading-tight uppercase tracking-tight">{card.title}</h3>
                    <div className="h-1 w-12 bg-white/30 mx-auto rounded-full group-hover:w-24 transition-all duration-500" />
                    <p className="text-[11px] opacity-80 leading-relaxed font-bold uppercase tracking-widest max-w-[200px] mx-auto">{card.desc}</p>
                  </div>
                  
                  <div className="mt-2 px-6 py-2 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-tighter text-white border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    {isInterface ? 'Open Secure Link' : 'Explore Now'}
                  </div>
                </div>
              );

              const gradientClass = 
                card.color === 'bg-postal-red' ? 'from-postal-red to-rose-700 shadow-red-500/20' :
                card.color === 'bg-[#009688]' ? 'from-emerald-500 to-teal-700 shadow-emerald-500/20' :
                card.color === 'bg-[#7e57c2]' ? 'from-violet-500 to-purple-700 shadow-violet-500/20' :
                'from-blue-500 to-indigo-700 shadow-blue-500/20';

              if (isInterface) {
                return (
                  <motion.button
                    key={card.title}
                    onClick={() => setShowAuth(true)}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ y: -10 }}
                    className={cn(
                      "relative overflow-hidden rounded-3xl p-8 shadow-2xl transition-all cursor-pointer group border-b-8 border-black/20 min-h-[300px] w-full bg-gradient-to-br",
                      gradientClass
                    )}
                  >
                    {CardContent}
                  </motion.button>
                );
              }

              return (
                <motion.a
                  key={card.title}
                  href={card.link}
                  target={card.link !== "#" ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -10 }}
                  className={cn(
                    "relative overflow-hidden rounded-3xl p-8 shadow-2xl transition-all cursor-pointer group border-b-8 border-black/20 min-h-[300px] bg-gradient-to-br",
                    gradientClass
                  )}
                >
                  {CardContent}
                </motion.a>
              );
            })}
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuth && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="bg-postal-red p-6 text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Lock size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">BD Interface Access</h3>
                    <p className="text-xs opacity-80 uppercase tracking-widest font-medium">Authentication Required</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setShowAuth(false);
                    setError('');
                  }}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAuth} className="p-8 space-y-6">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-red-50 text-red-600 p-4 rounded-lg text-sm font-medium border border-red-100"
                  >
                    {error}
                  </motion.div>
                )}

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">User ID</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="text"
                        placeholder="8-digit ID (starts with 1)"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-postal-red focus:ring-4 focus:ring-postal-red/10 outline-none transition-all font-medium"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="password"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-postal-red focus:ring-4 focus:ring-postal-red/10 outline-none transition-all font-medium"
                        required
                      />
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-postal-red text-white py-4 rounded-xl font-bold shadow-lg shadow-postal-red/30 hover:bg-red-700 hover:-translate-y-1 active:translate-y-0 transition-all"
                >
                  Access Interface
                </button>
                
                <p className="text-center text-[10px] text-slate-400 font-medium uppercase tracking-widest">
                  Authorized Personnel Only
                </p>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
