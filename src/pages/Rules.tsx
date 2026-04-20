import React from 'react';
import { motion } from 'motion/react';
import { 
  FileText, Shield, Scale, BookOpen,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export function Rules() {
  const cards = [
    {
      title: "Conduct Rules",
      desc: "CCS (Conduct) Rules, 1964 for Government Servants",
      link: "#",
      color: "bg-postal-red",
      icon: Shield
    },
    {
      title: "Disciplinary Rules",
      desc: "CCS (CCA) Rules, 1965 and Disciplinary Procedures",
      link: "#",
      color: "bg-[#009688]", // Teal
      icon: Scale
    },
    {
      title: "Financial Rules",
      desc: "General Financial Rules (GFR) and FHB Volume I & II",
      link: "#",
      color: "bg-[#7e57c2]", // Purple
      icon: FileText
    },
    {
      title: "Manuals & Guides",
      desc: "Postal Manual Volumes and Official Guidelines",
      link: "#",
      color: "bg-[#1976d2]", // Blue
      icon: BookOpen
    }
  ];

  return (
    <div className="min-h-screen bg-postal-bg flex flex-col font-sans selection:bg-postal-red selection:text-white">
      <div className="flex-1 relative overflow-hidden py-12">
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
              <h2 className="text-2xl font-bold text-slate-800">Postal Rules & Regulations</h2>
              <p className="text-sm text-slate-500">Official Conduct, Disciplinary, and Financial Guidelines</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {cards.map((card, i) => {
              const gradientClass = 
                card.color === 'bg-postal-red' ? 'from-postal-red to-rose-700 shadow-red-500/20' :
                card.color === 'bg-[#009688]' ? 'from-teal-500 to-emerald-700 shadow-emerald-500/20' :
                card.color === 'bg-[#7e57c2]' ? 'from-violet-500 to-purple-700 shadow-violet-500/20' :
                'from-blue-500 to-indigo-700 shadow-blue-500/20';

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
                    "relative overflow-hidden rounded-[2rem] p-8 shadow-2xl transition-all cursor-pointer group border-b-8 border-black/10 min-h-[260px] bg-gradient-to-br flex flex-col items-center justify-center text-center gap-6",
                    gradientClass
                  )}
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/20 blur-xl rounded-full scale-150 animate-pulse" />
                    <div className="relative bg-white p-5 rounded-2xl shadow-xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                      <card.icon className="text-slate-800" size={32} />
                    </div>
                  </div>
                  <div className="text-white space-y-2">
                    <h3 className="text-xl font-black leading-tight uppercase tracking-tight">{card.title}</h3>
                    <p className="text-[10px] opacity-80 leading-tight font-bold uppercase tracking-widest max-w-[180px] mx-auto">{card.desc}</p>
                  </div>
                  
                  <div className="px-5 py-2 bg-white/10 rounded-full text-[9px] font-black uppercase tracking-widest text-white border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    Read Document
                  </div>
                </motion.a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
