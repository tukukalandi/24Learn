import { motion } from 'motion/react';
import { 
  ArrowLeft, ExternalLink, FileText, Calendar, Shield, 
  GraduationCap, Plane, Home as HomeIcon, Briefcase, Users, 
  ChevronDown, Bell, Maximize2, Wifi, User, Barcode, Printer, Mail, BookUser,
  Info
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export function POGuide() {
  const cards = [
    {
      title: "CEA",
      desc: "Children Education Allowance Rules and Guidelines for Central Government Employees.",
      link: "https://children-education-allowance.vercel.app/",
      image: "https://picsum.photos/seed/education/400/250",
      color: "bg-blue-600",
      accent: "border-blue-600",
      icon: GraduationCap
    },
    {
      title: "Leave Rules",
      desc: "Central Civil Services (Leave) Rules, 1972 and subsequent amendments.",
      link: "https://leave-rules.vercel.app/",
      image: "https://picsum.photos/seed/calendar/400/250",
      color: "bg-orange-500",
      accent: "border-orange-500",
      icon: Calendar
    },
    {
      title: "LTC Rules",
      desc: "Leave Travel Concession Rules and Procedures for Government officials.",
      link: "https://leave-travel-concession.vercel.app/",
      image: "https://picsum.photos/seed/travel/400/250",
      color: "bg-emerald-600",
      accent: "border-emerald-600",
      icon: Plane
    },
    {
      title: "PO Rules 2024",
      desc: "Latest Post Office Rules and Regulations updated for the year 2024.",
      link: "#",
      image: "https://picsum.photos/seed/rules/400/250",
      color: "bg-postal-red",
      accent: "border-postal-red",
      icon: Shield
    }
  ];

  return (
    <div className="min-h-screen bg-[#f1f5f9] py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-500 font-bold hover:text-postal-red mb-4 transition-colors">
            <ArrowLeft size={18} /> Back to Home
          </Link>
          <h1 className="text-4xl font-black text-slate-900 border-l-8 border-postal-red pl-6 tracking-tight uppercase">
            PO Guide <span className="text-postal-red">& Rules</span>
          </h1>
          <p className="mt-4 text-slate-500 font-medium max-w-2xl px-6">Access official regulations and modern guidelines for Indian Postal Employees.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -10 }}
              className={cn(
                "bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col h-full border-b-8 transition-all group",
                card.accent
              )}
            >
              <div className="h-44 overflow-hidden relative">
                <img 
                  src={card.image} 
                  alt={card.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                <div className={cn(
                  "absolute -bottom-6 right-6 w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:rotate-6",
                  card.color
                )}>
                  <card.icon size={24} />
                </div>
              </div>
              <div className="p-6 pt-10 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-postal-red transition-colors">{card.title}</h3>
                <p className="text-sm text-slate-500 mb-8 flex-grow leading-relaxed font-medium">
                  {card.desc}
                </p>
                <div className="mt-auto">
                  <a
                    href={card.link}
                    target={card.link !== "#" ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className={cn(
                      "inline-flex items-center justify-between w-full px-5 py-3 text-xs font-black uppercase tracking-widest text-white rounded-xl transition-all shadow-md active:scale-95",
                      card.color
                    )}
                  >
                    Know More <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
