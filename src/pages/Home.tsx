import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { 
  ArrowRight, BookOpen, Video, PenTool, Trophy, ChevronRight, 
  Download, GraduationCap, Bell, Newspaper, Calendar, Info, 
  ExternalLink, FileText, LayoutGrid, Search, Users, Book,
  Globe, Mail, Phone, MapPin, Facebook, Twitter, Youtube, Instagram,
  Briefcase, Stamp, Package, MoreHorizontal, Calculator,
  AlertCircle, Landmark, ShieldCheck, Fingerprint, Map, FileDown, Smartphone, Send
} from 'lucide-react';

const SLIDES = [
  {
    image: "https://picsum.photos/seed/logistics/1920/600",
    title: "Global Postal Logistics",
    subtitle: "Seamless connectivity across the world with India Post.",
    color: "from-postal-red/60 to-transparent"
  },
  {
    image: "https://picsum.photos/seed/delivery/1920/600",
    title: "Speed Post 24",
    subtitle: "Guaranteed next-day delivery for your important parcels and documents.",
    color: "from-postal-red/60 to-transparent"
  },
  {
    image: "https://picsum.photos/seed/education/1920/600",
    title: "Pariksha Pe Charcha 2026",
    subtitle: "Join the conversation with Hon'ble PM Narendra Modi.",
    color: "from-blue-600/60 to-transparent"
  },
  {
    image: "https://picsum.photos/seed/stamps/1920/600",
    title: "World of Stamps",
    subtitle: "Explore the rich heritage of Indian Philately from 1854 to today.",
    color: "from-amber-600/60 to-transparent"
  },
  {
    image: "https://picsum.photos/seed/postal1/1920/600",
    title: "Excellence in Postal Departmental Exams",
    subtitle: "Comprehensive study material for GDS to MTS, Postman, and PA/SA exams.",
    color: "from-postal-red/80 to-transparent"
  },
  {
    image: "https://picsum.photos/seed/postal2/1920/600",
    title: "Master the Postal Knowledge",
    subtitle: "Detailed guides on Post Office Guide Part I, II, and Postal Manuals.",
    color: "from-blue-900/80 to-transparent"
  },
  {
    image: "https://picsum.photos/seed/postal3/1920/600",
    title: "Interactive Mock Tests",
    subtitle: "Evaluate your preparation with our specialized postal exam quizzes.",
    color: "from-emerald-900/80 to-transparent"
  }
];

const QUICK_LINKS = [
  { icon: BookOpen, title: "GDS to MTS", desc: "Study material for MTS recruitment", link: "/portal/mts" },
  { icon: GraduationCap, title: "Postman Exam", desc: "Resources for Postman/Mail Guard", link: "/portal/postman" },
  { icon: Trophy, title: "PA/SA Exam", desc: "Postal & Sorting Assistant material", link: "/portal/pa" },
  { icon: LayoutGrid, title: "LGO Exam", desc: "Lower Grade Official promotion", link: "/portal/lgo" },
  { icon: Newspaper, title: "IP Exam", desc: "Inspector Posts preparation", link: "/portal/inspector" },
  { icon: Book, title: "PO Guide", desc: "Post Office Guide Part I & II", link: "/portal/po-guide" },
  { icon: FileText, title: "Postal Manuals", desc: "Volume V, VI, and VII resources", link: "/portal/manuals" },
  { icon: Calculator, title: "Accountant Exam", desc: "PO Accountant Exam resources", link: "/portal/accountant" },
];

const BRANCHES = [
  { name: 'Mail Branch', icon: Mail, desc: 'Mail processing and delivery operations' },
  { name: 'BD Branch', icon: Briefcase, desc: 'Business Development and marketing' },
  { name: 'Philately Branch', icon: Stamp, desc: 'Stamps and collector services' },
  { name: 'Parcel Branch', icon: Package, desc: 'Parcel and logistics management' },
  { name: 'CCS Branch', icon: Users, desc: 'Central Civil Services guidelines' },
  { name: 'Other Branch', icon: MoreHorizontal, desc: 'Miscellaneous postal operations' },
];

const SERVICES = [
  { title: "Track Consignment", icon: Search, color: "text-emerald-600", bg: "bg-emerald-50", link: "https://www.indiapost.gov.in/" },
  { title: "PMV Ticket raise", icon: AlertCircle, color: "text-red-500", bg: "bg-red-50", link: "https://pmv-toolkit.vercel.app/" },
  { title: "Locate Post Office", icon: MapPin, color: "text-postal-red", bg: "bg-red-50" },
  { title: "Internet Banking", icon: Landmark, color: "text-amber-600", bg: "bg-amber-50", link: "https://ebanking.indiapost.gov.in/corp/AuthenticationController?FORMSGROUP_ID__=AuthenticationFG&__START_TRAN_FLAG__=Y&__FG_BUTTONS__=LOAD&ACTION.LOAD=Y&AuthenticationFG.LOGIN_FLAG=1&BANK_ID=DOP" },
  { title: "PLI / RPLI", icon: ShieldCheck, color: "text-blue-600", bg: "bg-blue-50" },
  { title: "Postage Calculator", icon: Calculator, color: "text-orange-500", bg: "bg-orange-50", link: "https://www.indiapost.gov.in/calculate-postage" },
  { title: "Aadhaar Services", icon: Fingerprint, color: "text-indigo-600", bg: "bg-indigo-50" },
  { title: "DIGIPIN", icon: Map, color: "text-rose-500", bg: "bg-rose-50", link: "https://dac.indiapost.gov.in/mydigipin/home" },
  { title: "Download Forms", icon: FileDown, color: "text-slate-600", bg: "bg-slate-50", link: "https://postal-forms.vercel.app/" },
  { title: "Ready Reckoner", icon: Book, color: "text-amber-800", bg: "bg-amber-50", link: "https://drive.google.com/file/d/1FfyMvtgGqJIKPZ0u3dEi_l6npik7t9oL/view?usp=sharing" },
  { title: "IPPB Service", icon: Smartphone, color: "text-blue-500", bg: "bg-blue-50" },
  { title: "Money Transfer", icon: Send, color: "text-cyan-600", bg: "bg-cyan-50" },
];

const CARD_COLORS = [
  { border: 'border-blue-500', icon: 'bg-blue-50 text-blue-600', text: 'text-blue-700', shadow: 'hover:shadow-blue-500/20', accent: 'bg-blue-600' },
  { border: 'border-emerald-500', icon: 'bg-emerald-50 text-emerald-600', text: 'text-emerald-700', shadow: 'hover:shadow-emerald-500/20', accent: 'bg-emerald-600' },
  { border: 'border-rose-500', icon: 'bg-rose-50 text-rose-600', text: 'text-rose-700', shadow: 'hover:shadow-rose-500/20', accent: 'bg-rose-600' },
  { border: 'border-amber-500', icon: 'bg-amber-50 text-amber-600', text: 'text-amber-700', shadow: 'hover:shadow-amber-500/20', accent: 'bg-amber-600' },
  { border: 'border-violet-500', icon: 'bg-violet-50 text-violet-600', text: 'text-violet-700', shadow: 'hover:shadow-violet-500/20', accent: 'bg-violet-600' },
  { border: 'border-cyan-500', icon: 'bg-cyan-50 text-cyan-600', text: 'text-cyan-700', shadow: 'hover:shadow-cyan-500/20', accent: 'bg-cyan-600' },
  { border: 'border-orange-500', icon: 'bg-orange-50 text-orange-600', text: 'text-orange-700', shadow: 'hover:shadow-orange-500/20', accent: 'bg-orange-600' },
  { border: 'border-indigo-500', icon: 'bg-indigo-50 text-indigo-600', text: 'text-indigo-700', shadow: 'hover:shadow-indigo-500/20', accent: 'bg-indigo-600' },
];

export function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Hero Slider Section */}
      <div className="relative h-[400px] md:h-[500px] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            <img 
              src={SLIDES[currentSlide].image} 
              className="w-full h-full object-cover"
              alt="Hero"
              referrerPolicy="no-referrer"
            />
            <div className={`absolute inset-0 bg-gradient-to-r ${SLIDES[currentSlide].color} flex items-center`}>
              <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8">
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="max-w-2xl text-white"
                >
                  <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
                    {SLIDES[currentSlide].title}
                  </h1>
                  <p className="text-lg md:text-xl opacity-90 mb-8">
                    {SLIDES[currentSlide].subtitle}
                  </p>
                  <div className="flex gap-4">
                    <button className="bg-postal-yellow text-slate-900 px-8 py-3 rounded-sm font-bold hover:bg-white transition-colors">
                      Learn More
                    </button>
                    <button className="border-2 border-white text-white px-8 py-3 rounded-sm font-bold hover:bg-white/10 transition-colors">
                      Explore Resources
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
        
        {/* Slider Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-2 rounded-full transition-all duration-300 ${currentSlide === i ? 'w-8 bg-postal-yellow' : 'w-2 bg-white/50'}`}
            />
          ))}
        </div>
      </div>

      {/* Quick Links Grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-20 relative z-20 mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {QUICK_LINKS.map((item, i) => {
            const color = CARD_COLORS[i % CARD_COLORS.length];
            return (
              <Link
                key={i}
                to={item.link}
                className="block group"
              >
                <motion.div
                  whileHover={{ y: -8, scale: 1.02 }}
                  className={cn(
                    "bg-white p-6 rounded-3xl shadow-xl border-l-8 transition-all h-full text-center flex flex-col items-center",
                    color.border,
                    color.shadow
                  )}
                >
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all group-hover:scale-110",
                    color.icon
                  )}>
                    <item.icon size={28} />
                  </div>
                  <h3 className={cn("font-black text-sm uppercase tracking-tight mb-1", color.text)}>{item.title}</h3>
                  <p className="text-[10px] text-slate-500 leading-tight font-medium opacity-70 group-hover:opacity-100 transition-opacity uppercase tracking-widest">{item.desc}</p>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>


      {/* Branch Portal Section */}
      <div className="bg-white border-y border-slate-200 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-postal-red mb-4">My Branch Portal</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Access specialized resources and operational guidelines for various postal branches.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {BRANCHES.map((branch, i) => {
              const color = CARD_COLORS[(i + 4) % CARD_COLORS.length];
              return (
                <motion.div
                  key={branch.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  onClick={() => {
                    if (branch.name === 'BD Branch') {
                      window.open('https://bd-branch-dhenkanal.vercel.app/', '_blank');
                    } else if (branch.name === 'Mail Branch') {
                      window.open('https://mail-branch.vercel.app/', '_blank');
                    } else if (branch.name === 'Savings Branch') {
                      navigate('/branch/savings');
                    } else if (branch.name === 'Other Branch') {
                      navigate('/branch/other');
                    } else if (branch.name === 'Philately Branch') {
                      window.open('https://philately.vercel.app/', '_blank');
                    }
                  }}
                  className={cn(
                    "group p-8 bg-white rounded-[2rem] border-2 shadow-lg transition-all cursor-pointer",
                    color.border,
                    color.shadow
                  )}
                >
                  <div className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all group-hover:scale-110 shadow-md",
                    color.icon
                  )}>
                    <branch.icon size={32} />
                  </div>
                  <h3 className={cn("text-2xl font-black mb-2 uppercase tracking-tight", color.text)}>{branch.name}</h3>
                  <p className="text-sm text-slate-500 mb-6 font-medium leading-relaxed opacity-80 group-hover:opacity-100">{branch.desc}</p>
                  <div className={cn(
                    "flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all",
                    color.text
                  )}>
                    Explore Branch <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Our Services Section */}
      <div className="bg-slate-50 py-20 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block bg-postal-yellow text-slate-900 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 shadow-sm">
              Our Services
            </div>
            <h2 className="text-4xl font-bold text-slate-800 mb-4">What would you like to do today?</h2>
            <p className="text-slate-500">Access all postal services of Dhenkanal Division</p>
            <div className="w-20 h-1 bg-postal-yellow mx-auto mt-6 rounded-full" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {SERVICES.map((service, i) => {
              const CardContent = (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -5 }}
                  className="bg-white p-6 rounded-sm shadow-sm border border-slate-100 flex flex-col items-center text-center group cursor-pointer hover:shadow-md transition-all h-full"
                >
                  <div className={`w-12 h-12 ${service.bg} rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <service.icon size={24} className={service.color} />
                  </div>
                  <h3 className="text-xs font-bold text-slate-700 leading-tight">{service.title}</h3>
                </motion.div>
              );

              if (service.link) {
                return (
                  <a 
                    key={service.title} 
                    href={service.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block h-full"
                  >
                    {CardContent}
                  </a>
                );
              }

              return (
                <div key={service.title}>
                  {CardContent}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left: News & Announcements */}
        <div className="lg:col-span-4 space-y-8">
          <div>
            <div className="flex items-center justify-between border-b-2 border-postal-red pb-2 mb-4">
              <h2 className="text-xl font-bold text-postal-red flex items-center gap-2">
                <Bell size={20} /> Announcements
              </h2>
              <button className="text-xs font-bold text-slate-400 hover:text-postal-red uppercase tracking-wider">View All</button>
            </div>
            <div className="space-y-4">
              {[
                "Notification for GDS to MTS Exam 2026 released.",
                "New Mock Test for PA/SA Exam added.",
                "Updated PO Guide Part I notes available.",
                "Join our Telegram group for daily updates."
              ].map((news, i) => (
                <div key={i} className="flex gap-3 group cursor-pointer">
                  <div className="min-w-[4px] bg-postal-red/20 rounded-full group-hover:bg-postal-red transition-colors" />
                  <p className="text-sm text-slate-600 group-hover:text-postal-red transition-colors">{news}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-postal-red/5 p-6 rounded-sm border border-postal-red/10">
            <h3 className="font-bold text-postal-red mb-4 flex items-center gap-2">
              <Info size={18} /> Quick Help
            </h3>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex items-center gap-2 hover:text-postal-red cursor-pointer" onClick={() => window.open('https://docs.google.com/spreadsheets/d/1ge75tHFQSI0vQFVsAnaVwQ7X2K6G-94fwLg0Jy0eL_4/edit?gid=0#gid=0', '_blank')}>
                <ChevronRight size={14} /> Job specification contact details of CO
              </li>
              <li className="flex items-center gap-2 hover:text-postal-red cursor-pointer">
                <ChevronRight size={14} /> Copyright Policy
              </li>
              <li className="flex items-center gap-2 hover:text-postal-red cursor-pointer">
                <ChevronRight size={14} /> Feedback on Textbooks
              </li>
            </ul>
          </div>
        </div>

        {/* Right: Featured Sections */}
        <div className="lg:col-span-8 space-y-12">
          {/* Featured Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-sm shadow-sm border border-slate-100 group cursor-pointer">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Video size={24} />
                </div>
                <h3 className="font-bold text-lg">Virtual Classes</h3>
              </div>
              <p className="text-sm text-slate-500 mb-4">Watch high-quality educational videos and live sessions by expert teachers.</p>
              <button className="text-postal-red font-bold text-xs flex items-center gap-1 hover:underline">
                EXPLORE VIDEOS <ExternalLink size={12} />
              </button>
            </div>

            <div className="bg-white p-6 rounded-sm shadow-sm border border-slate-100 group cursor-pointer">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-sm group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <PenTool size={24} />
                </div>
                <h3 className="font-bold text-lg">Practice Quizzes</h3>
              </div>
              <p className="text-sm text-slate-500 mb-4">Test your knowledge with interactive quizzes and track your progress.</p>
              <button className="text-postal-red font-bold text-xs flex items-center gap-1 hover:underline">
                START QUIZ <ExternalLink size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
