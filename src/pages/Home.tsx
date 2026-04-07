import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, BookOpen, Video, PenTool, Trophy, ChevronRight, 
  Download, GraduationCap, Bell, Newspaper, Calendar, Info, 
  ExternalLink, FileText, LayoutGrid, Search, Users, Book,
  Globe, Mail, Phone, MapPin, Facebook, Twitter, Youtube, Instagram,
  Briefcase, Stamp, Package, MoreHorizontal
} from 'lucide-react';

const SLIDES = [
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
  { icon: BookOpen, title: "GDS to MTS", desc: "Study material for MTS recruitment", link: "/exams/mts" },
  { icon: GraduationCap, title: "Postman Exam", desc: "Resources for Postman/Mail Guard", link: "/exams/postman" },
  { icon: Trophy, title: "PA/SA Exam", desc: "Postal & Sorting Assistant material", link: "/exams/pa" },
  { icon: LayoutGrid, title: "LGO Exam", desc: "Lower Grade Official promotion", link: "/exams/lgo" },
  { icon: Newspaper, title: "IP Exam", desc: "Inspector Posts preparation", link: "/exams/inspector" },
  { icon: Book, title: "PO Guide", desc: "Post Office Guide Part I & II", link: "/exams/po-guide" },
  { icon: FileText, title: "Postal Manuals", desc: "Volume V, VI, and VII resources", link: "/exams/manuals" },
  { icon: Info, title: "Contact", desc: "Get in touch for guidance", link: "/contact" },
];

const BRANCHES = [
  { name: 'Mail Branch', icon: Mail, desc: 'Mail processing and delivery operations' },
  { name: 'BD Branch', icon: Briefcase, desc: 'Business Development and marketing' },
  { name: 'Philately Branch', icon: Stamp, desc: 'Stamps and collector services' },
  { name: 'Parcel Branch', icon: Package, desc: 'Parcel and logistics management' },
  { name: 'CCS Branch', icon: Users, desc: 'Central Civil Services guidelines' },
  { name: 'Other Branch', icon: MoreHorizontal, desc: 'Miscellaneous postal operations' },
];

export function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

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
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {QUICK_LINKS.map((item, i) => (
            <motion.a
              key={i}
              href={item.link}
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-sm shadow-lg border-b-4 border-postal-red flex flex-col items-center text-center group transition-all"
            >
              <div className="w-12 h-12 bg-postal-red/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-postal-red group-hover:text-white transition-colors">
                <item.icon size={24} className="text-postal-red group-hover:text-white" />
              </div>
              <h3 className="font-bold text-slate-800 mb-1">{item.title}</h3>
              <p className="text-[11px] text-slate-500 leading-tight">{item.desc}</p>
            </motion.a>
          ))}
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
            {BRANCHES.map((branch, i) => (
              <motion.div
                key={branch.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-6 bg-slate-50 rounded-sm border border-slate-100 hover:bg-white hover:shadow-xl hover:border-postal-red/20 transition-all cursor-pointer"
              >
                <div className="w-12 h-12 bg-postal-red/5 rounded-sm flex items-center justify-center text-postal-red mb-4 group-hover:bg-postal-red group-hover:text-white transition-colors">
                  <branch.icon size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{branch.name}</h3>
                <p className="text-sm text-slate-500 mb-4">{branch.desc}</p>
                <div className="flex items-center gap-1 text-xs font-bold text-postal-red uppercase tracking-wider group-hover:gap-2 transition-all">
                  Explore Branch <ArrowRight size={14} />
                </div>
              </motion.div>
            ))}
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
              <li className="flex items-center gap-2 hover:text-postal-red cursor-pointer">
                <ChevronRight size={14} /> How to download PDFs?
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
