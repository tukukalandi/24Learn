import React from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, PiggyBank, FileWarning, Database, FileText, 
  ExternalLink, ChevronRight, Globe 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function SavingsBranch() {
  const cards = [
    {
      title: "Savings Scheme",
      desc: "Explore various Post Office Savings Schemes including SB, RD, TD, MIS, SCSS, PPF, SSA, KVP, and NSC.",
      link: "https://www.indiapost.gov.in/banking-services/savings",
      isExternal: true,
      image: "https://picsum.photos/seed/savings/400/250",
      icon: PiggyBank
    },
    {
      title: "Net Banking",
      desc: "Access your Post Office Savings Account online through the official DoP Internet Banking portal.",
      link: "https://ebanking.indiapost.gov.in/corp/AuthenticationController?FORMSGROUP_ID__=AuthenticationFG&__START_TRAN_FLAG__=Y&__FG_BUTTONS__=LOAD&ACTION.LOAD=Y&AuthenticationFG.LOGIN_FLAG=1&BANK_ID=DOP",
      isExternal: true,
      image: "https://picsum.photos/seed/ebanking/400/250",
      icon: Globe
    },
    {
      title: "Death Claim Procedure",
      desc: "Detailed guidelines and procedures for settlement of deceased claim cases in Post Office Savings Bank.",
      link: "#",
      isExternal: false,
      image: "https://picsum.photos/seed/procedure/400/250",
      icon: FileWarning
    },
    {
      title: "Finacle",
      desc: "Resources, guides, and operational manuals for Finacle Core Banking Solution (CBS) used in Post Offices.",
      link: "#",
      isExternal: false,
      image: "https://picsum.photos/seed/finacle/400/250",
      icon: Database
    },
    {
      title: "SB Documents",
      desc: "Download essential forms, registers, and documentation required for Savings Bank operations.",
      link: "https://www.indiapost.gov.in/documents/reports/forms",
      isExternal: true,
      image: "https://picsum.photos/seed/documents/400/250",
      icon: FileText
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <Link to="/" className="inline-flex items-center gap-2 text-postal-red font-bold hover:underline mb-4">
            <ArrowLeft size={18} /> Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 border-l-4 border-postal-red pl-4">Savings Branch Portal</h1>
          <p className="text-slate-500 mt-2 max-w-2xl">Access specialized resources, schemes, and operational guidelines for the Savings Bank branch.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-sm shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full group"
            >
              <div className="h-48 overflow-hidden relative">
                <img 
                  src={card.image} 
                  alt={card.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-postal-red shadow-lg">
                  <card.icon size={20} />
                </div>
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-postal-red mb-2">{card.title}</h3>
                <p className="text-sm text-slate-600 mb-6 flex-grow leading-relaxed">
                  {card.desc}
                </p>
                <div>
                  {card.isExternal ? (
                    <a
                      href={card.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 border border-postal-red text-postal-red px-4 py-1.5 text-sm font-medium rounded-sm hover:bg-postal-red hover:text-white transition-colors"
                    >
                      Click to Know More <ExternalLink size={14} />
                    </a>
                  ) : (
                    <Link
                      to={card.link}
                      className="inline-flex items-center gap-2 border border-postal-red text-postal-red px-4 py-1.5 text-sm font-medium rounded-sm hover:bg-postal-red hover:text-white transition-colors"
                    >
                      Explore Resources <ChevronRight size={14} />
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
