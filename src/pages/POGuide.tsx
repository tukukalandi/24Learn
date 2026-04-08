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
      desc: "Children Education Allowance Rules and Guidelines for Central Government Employees.",
      link: "https://children-education-allowance.vercel.app/",
      image: "https://picsum.photos/seed/education/400/250"
    },
    {
      title: "Leave Rules",
      desc: "Central Civil Services (Leave) Rules, 1972 and subsequent amendments.",
      link: "https://leave-rules.vercel.app/",
      image: "https://picsum.photos/seed/calendar/400/250"
    },
    {
      title: "LTC Rules",
      desc: "Leave Travel Concession Rules and Procedures for Government officials.",
      link: "https://leave-travel-concession.vercel.app/",
      image: "https://picsum.photos/seed/travel/400/250"
    },
    {
      title: "PO Rules 2024",
      desc: "Latest Post Office Rules and Regulations updated for the year 2024.",
      link: "#",
      image: "https://picsum.photos/seed/rules/400/250"
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <Link to="/" className="inline-flex items-center gap-2 text-postal-red font-bold hover:underline mb-4">
            <ArrowLeft size={18} /> Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 border-l-4 border-postal-red pl-4">PO Guide & Rules</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-sm shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full"
            >
              <div className="h-48 overflow-hidden">
                <img 
                  src={card.image} 
                  alt={card.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-postal-red mb-2">{card.title}</h3>
                <p className="text-sm text-slate-600 mb-6 flex-grow leading-relaxed">
                  {card.desc}
                </p>
                <div>
                  <a
                    href={card.link}
                    target={card.link !== "#" ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="inline-block border border-postal-red text-postal-red px-4 py-1.5 text-sm font-medium rounded-sm hover:bg-postal-red hover:text-white transition-colors"
                  >
                    Click to Know More
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
