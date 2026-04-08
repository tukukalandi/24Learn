import React from 'react';
import { motion } from 'motion/react';
import { 
  FileText, BarChart3, CreditCard, LayoutDashboard,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function BDBranch() {
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
      link: "#",
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
                className={`${card.color} rounded-md p-5 flex flex-col items-center justify-center text-center gap-4 shadow-md hover:shadow-xl transition-all cursor-pointer group border border-white/10 min-h-[220px]`}
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
