import { motion } from 'motion/react';
import { 
  ArrowLeft, ExternalLink, FileText, Calendar, Shield, 
  GraduationCap, Plane, Home as HomeIcon, Briefcase, Users, 
  ChevronDown, Bell, Maximize2, Wifi, User, Barcode, Printer, Mail, BookUser,
  Info
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function POGuide() {
  const cards = [
    {
      title: "CEA",
      desc: "Children Education Allowance Rules and Guidelines",
      link: "https://children-education-allowance.vercel.app/",
      color: "bg-postal-red",
      icon: GraduationCap
    },
    {
      title: "Leave Rules",
      desc: "Central Civil Services (Leave) Rules",
      link: "https://leave-rules.vercel.app/",
      color: "bg-[#009688]", // Teal
      icon: Calendar
    },
    {
      title: "LTC Rules",
      desc: "Leave Travel Concession Rules and Procedures",
      link: "https://leave-travel-concession.vercel.app/",
      color: "bg-[#7e57c2]", // Purple
      icon: Plane
    },
    {
      title: "PO Rules 2024",
      desc: "Latest Post Office Rules and Regulations 2024",
      link: "#",
      color: "bg-[#1976d2]", // Blue
      icon: Shield
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card, i) => (
              <motion.a
                key={card.title}
                href={card.link}
                target={card.link !== "#" ? "_blank" : undefined}
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`${card.color} rounded-md p-5 flex flex-col items-center justify-center text-center gap-4 shadow-md hover:shadow-xl transition-all cursor-pointer group border border-white/10 min-h-[200px]`}
              >
                <div className="bg-white p-4 rounded-full shadow-inner group-hover:scale-110 transition-transform flex-shrink-0">
                  <card.icon className="text-slate-700" size={32} />
                </div>
                <div className="text-white">
                  <h3 className="text-lg font-bold leading-tight">{card.title}</h3>
                  <p className="text-[11px] opacity-90 mt-1 leading-tight font-medium">{card.desc}</p>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
