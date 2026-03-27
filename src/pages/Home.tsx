import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, BookOpen, Video, PenTool, Trophy, ChevronRight, 
  Download, GraduationCap, Bell, Newspaper, Calendar, Info, 
  ExternalLink, FileText, LayoutGrid, Search, Users, Book,
  Globe, Mail, Phone, MapPin, Facebook, Twitter, Youtube, Instagram
} from 'lucide-react';

const SLIDES = [
  {
    image: "https://picsum.photos/seed/edu1/1920/600",
    title: "Empowering Education Through Digital Innovation",
    subtitle: "Access high-quality NCERT textbooks and resources anywhere, anytime.",
    color: "from-ncert-maroon/80 to-transparent"
  },
  {
    image: "https://picsum.photos/seed/edu2/1920/600",
    title: "Comprehensive Learning Resources for All Classes",
    subtitle: "From Class I to XII, find everything you need for academic excellence.",
    color: "from-blue-900/80 to-transparent"
  },
  {
    image: "https://picsum.photos/seed/edu3/1920/600",
    title: "Interactive Quizzes and Video Lessons",
    subtitle: "Engage with content through modern pedagogical tools and multimedia.",
    color: "from-emerald-900/80 to-transparent"
  }
];

const QUICK_LINKS = [
  { icon: BookOpen, title: "E-Textbooks", desc: "Digital versions of all NCERT books", link: "/" },
  { icon: FileText, title: "Syllabus", desc: "Latest academic curriculum", link: "/publications" },
  { icon: GraduationCap, title: "Results", desc: "Examination results and analytics", link: "/competitive-exams" },
  { icon: LayoutGrid, title: "Programs", desc: "Educational initiatives & schemes", link: "/about" },
  { icon: Newspaper, title: "Journals", desc: "Research and academic publications", link: "/publications" },
  { icon: Calendar, title: "Events", desc: "Upcoming workshops and seminars", link: "/contact" },
  { icon: Users, title: "About Us", desc: "Our mission and organization", link: "/about" },
  { icon: Info, title: "Contact", desc: "Get in touch with our support team", link: "/contact" },
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
                    <button className="bg-white text-ncert-maroon px-8 py-3 rounded-sm font-bold hover:bg-slate-100 transition-colors">
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
              className={`h-2 rounded-full transition-all duration-300 ${currentSlide === i ? 'w-8 bg-white' : 'w-2 bg-white/50'}`}
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
              className="bg-white p-6 rounded-sm shadow-lg border-b-4 border-ncert-maroon flex flex-col items-center text-center group transition-all"
            >
              <div className="w-12 h-12 bg-ncert-maroon/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-ncert-maroon group-hover:text-white transition-colors">
                <item.icon size={24} className="text-ncert-maroon group-hover:text-white" />
              </div>
              <h3 className="font-bold text-slate-800 mb-1">{item.title}</h3>
              <p className="text-[11px] text-slate-500 leading-tight">{item.desc}</p>
            </motion.a>
          ))}
        </div>
      </div>

      {/* Main Content Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left: News & Announcements */}
        <div className="lg:col-span-4 space-y-8">
          <div>
            <div className="flex items-center justify-between border-b-2 border-ncert-maroon pb-2 mb-4">
              <h2 className="text-xl font-bold text-ncert-maroon flex items-center gap-2">
                <Bell size={20} /> Announcements
              </h2>
              <button className="text-xs font-bold text-slate-400 hover:text-ncert-maroon uppercase tracking-wider">View All</button>
            </div>
            <div className="space-y-4">
              {[
                "New E-Textbooks for Class X (2026-27) released.",
                "National Achievement Survey 2026 Participation Guide.",
                "Teacher Training Workshop on Digital Pedagogy.",
                "Revised Syllabus for Secondary Education (Phase II)."
              ].map((news, i) => (
                <div key={i} className="flex gap-3 group cursor-pointer">
                  <div className="min-w-[4px] bg-ncert-maroon/20 rounded-full group-hover:bg-ncert-maroon transition-colors" />
                  <p className="text-sm text-slate-600 group-hover:text-ncert-maroon transition-colors">{news}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-ncert-maroon/5 p-6 rounded-sm border border-ncert-maroon/10">
            <h3 className="font-bold text-ncert-maroon mb-4 flex items-center gap-2">
              <Info size={18} /> Quick Help
            </h3>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex items-center gap-2 hover:text-ncert-maroon cursor-pointer">
                <ChevronRight size={14} /> How to download PDFs?
              </li>
              <li className="flex items-center gap-2 hover:text-ncert-maroon cursor-pointer">
                <ChevronRight size={14} /> Copyright Policy
              </li>
              <li className="flex items-center gap-2 hover:text-ncert-maroon cursor-pointer">
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
              <button className="text-ncert-maroon font-bold text-xs flex items-center gap-1 hover:underline">
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
              <button className="text-ncert-maroon font-bold text-xs flex items-center gap-1 hover:underline">
                START QUIZ <ExternalLink size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <footer className="bg-[#1a1a1a] text-white pt-16 pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <span className="text-ncert-maroon font-black text-xl">२४</span>
                </div>
                <span className="text-xl font-bold tracking-tighter">२४लर्न / 24Learn</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Dedicated to providing high-quality educational resources and textbooks to students across the nation. Empowering the next generation through digital learning.
              </p>
              <div className="flex gap-4">
                <Facebook size={20} className="text-slate-400 hover:text-white cursor-pointer transition-colors" />
                <Twitter size={20} className="text-slate-400 hover:text-white cursor-pointer transition-colors" />
                <Youtube size={20} className="text-slate-400 hover:text-white cursor-pointer transition-colors" />
                <Instagram size={20} className="text-slate-400 hover:text-white cursor-pointer transition-colors" />
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-ncert-maroon uppercase tracking-widest text-xs">Quick Links</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li className="hover:text-white cursor-pointer transition-colors">E-Textbooks</li>
                <li className="hover:text-white cursor-pointer transition-colors">Syllabus</li>
                <li className="hover:text-white cursor-pointer transition-colors">Journals</li>
                <li className="hover:text-white cursor-pointer transition-colors">Programs</li>
                <li className="hover:text-white cursor-pointer transition-colors">Announcements</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-ncert-maroon uppercase tracking-widest text-xs">Resources</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li className="hover:text-white cursor-pointer transition-colors">Video Lessons</li>
                <li className="hover:text-white cursor-pointer transition-colors">Practice Quizzes</li>
                <li className="hover:text-white cursor-pointer transition-colors">Digital Notes</li>
                <li className="hover:text-white cursor-pointer transition-colors">Exam Results</li>
                <li className="hover:text-white cursor-pointer transition-colors">Teacher Portal</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-ncert-maroon uppercase tracking-widest text-xs">Contact Us</h4>
              <ul className="space-y-4 text-sm text-slate-400">
                <li className="flex gap-3">
                  <MapPin size={18} className="text-ncert-maroon shrink-0" />
                  <span>NCERT Campus, Sri Aurobindo Marg, New Delhi-110016</span>
                </li>
                <li className="flex gap-3">
                  <Phone size={18} className="text-ncert-maroon shrink-0" />
                  <span>+91-11-26560464</span>
                </li>
                <li className="flex gap-3">
                  <Mail size={18} className="text-ncert-maroon shrink-0" />
                  <span>contact@24learn.edu.in</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-slate-500 uppercase tracking-[0.2em]">
            <p>© 2026 24Learn Portal. All rights reserved.</p>
            <div className="flex gap-6">
              <span className="hover:text-white cursor-pointer">Privacy Policy</span>
              <span className="hover:text-white cursor-pointer">Terms of Service</span>
              <span className="hover:text-white cursor-pointer">Copyright Policy</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
