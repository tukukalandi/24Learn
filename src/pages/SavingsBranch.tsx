import React from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, PiggyBank, FileWarning, Database, FileText, 
  ExternalLink, ChevronRight, Globe 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export function SavingsBranch() {
  const cards = [
    {
      title: "Savings Scheme",
      desc: "Explore various Post Office Savings Schemes including SB, RD, TD, MIS, SCSS, PPF, SSA, KVP, and NSC.",
      link: "https://www.indiapost.gov.in/banking-services/savings",
      isExternal: true,
      image: "https://picsum.photos/seed/savings/400/250",
      icon: PiggyBank,
      color: "bg-emerald-500",
      accent: "border-emerald-500",
      hover: "group-hover:bg-emerald-600"
    },
    {
      title: "Net Banking",
      desc: "Access your Post Office Savings Account online through the official DoP Internet Banking portal.",
      link: "https://ebanking.indiapost.gov.in/corp/AuthenticationController?FORMSGROUP_ID__=AuthenticationFG&__START_TRAN_FLAG__=Y&__FG_BUTTONS__=LOAD&ACTION.LOAD=Y&AuthenticationFG.LOGIN_FLAG=1&BANK_ID=DOP",
      isExternal: true,
      image: "https://picsum.photos/seed/ebanking/400/250",
      icon: Globe,
      color: "bg-blue-500",
      accent: "border-blue-500",
      hover: "group-hover:bg-blue-600"
    },
    {
      title: "Death Claim Procedure",
      desc: "Detailed guidelines and procedures for settlement of deceased claim cases in Post Office Savings Bank.",
      link: "#",
      isExternal: false,
      image: "https://picsum.photos/seed/procedure/400/250",
      icon: FileWarning,
      color: "bg-rose-500",
      accent: "border-rose-500",
      hover: "group-hover:bg-rose-600"
    },
    {
      title: "Finacle",
      desc: "Resources, guides, and operational manuals for Finacle Core Banking Solution (CBS) used in Post Offices.",
      link: "#",
      isExternal: false,
      image: "https://picsum.photos/seed/finacle/400/250",
      icon: Database,
      color: "bg-amber-500",
      accent: "border-amber-500",
      hover: "group-hover:bg-amber-600"
    },
    {
      title: "SB Documents",
      desc: "Download essential forms, registers, and documentation required for Savings Bank operations.",
      link: "https://www.indiapost.gov.in/documents/reports/forms",
      isExternal: true,
      image: "https://picsum.photos/seed/documents/400/250",
      icon: FileText,
      color: "bg-violet-500",
      accent: "border-violet-500",
      hover: "group-hover:bg-violet-600"
    }
  ];

  return (
    <div className="min-h-screen bg-[#f1f5f9] py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-600 font-bold hover:text-postal-red mb-4 transition-colors">
            <ArrowLeft size={18} /> Back to Home
          </Link>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-2">
            Savings Branch <span className="text-postal-red">Portal</span>
          </h1>
          <p className="text-slate-500 max-w-2xl font-medium">Access specialized resources, schemes, and operational guidelines for the Savings Bank branch.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -8 }}
              className={cn(
                "bg-white rounded-xl shadow-xl overflow-hidden flex flex-col h-full border-2 transition-all group",
                card.accent
              )}
            >
              <div className="h-56 overflow-hidden relative">
                <img 
                  src={card.image} 
                  alt={card.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                <div className={cn(
                  "absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center text-white shadow-2xl transition-all z-10",
                  card.color,
                  card.hover
                )}>
                  <card.icon size={24} />
                </div>
                <div className="absolute bottom-4 left-4 right-4 z-10">
                  <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white", card.color)}>
                    {card.isExternal ? 'Official Resource' : 'Internal Guide'}
                  </span>
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow bg-white">
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-postal-red transition-colors">{card.title}</h3>
                <p className="text-sm text-slate-600 mb-8 flex-grow leading-relaxed font-medium">
                  {card.desc}
                </p>
                <div className="mt-auto">
                  {card.isExternal ? (
                    <a
                      href={card.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "inline-flex items-center justify-center w-full gap-2 px-6 py-3 text-sm font-black uppercase tracking-widest text-white rounded-lg transition-all shadow-lg active:scale-95",
                        card.color,
                        card.hover
                      )}
                    >
                      Visit Official Portal <ExternalLink size={16} />
                    </a>
                  ) : (
                    <Link
                      to={card.link}
                      className={cn(
                        "inline-flex items-center justify-center w-full gap-2 px-6 py-3 text-sm font-black uppercase tracking-widest text-white rounded-lg transition-all shadow-lg active:scale-95",
                        card.color,
                        card.hover
                      )}
                    >
                      Explore Internal Resources <ChevronRight size={16} />
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
