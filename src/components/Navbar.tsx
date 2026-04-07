import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, GraduationCap, Trophy, Menu, X, User, LogOut, Settings, ChevronRight, Globe, Type, Eye } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { cn } from '../lib/utils';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [classes, setClasses] = useState<any[]>([]);
  const navigate = useNavigate();

  const [subjectsList, setSubjectsList] = useState<any[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const unsubClasses = onSnapshot(query(collection(db, 'classes'), orderBy('order')), (snap) => {
      setClasses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'classes'));

    const unsubSubjects = onSnapshot(collection(db, 'subjects'), (snap) => {
      setSubjectsList(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'subjects'));

    return () => {
      unsubClasses();
      unsubSubjects();
    };
  }, []);

  const examCategories = [
    { name: 'GDS to MTS', search: ['mts'] },
    { name: 'GDS to Postman', search: ['postman'] },
    { name: 'PA/SA Exam', search: ['pa', 'sa'] },
    { name: 'LGO Exam', search: ['lgo'] },
    { name: 'IP Exam', search: ['inspector'] },
  ];

  const getClassesForSubject = (searchTerms: string[]) => {
    const relevantSubjects = subjectsList.filter(s => 
      searchTerms.some(term => s.name.toLowerCase().includes(term))
    );
    const classIds = relevantSubjects.map(s => s.classId);
    return classes.filter(c => classIds.includes(c.id));
  };

  const getSubjectIdForClass = (classId: string, searchTerms: string[]) => {
    const sub = subjectsList.find(s => 
      s.classId === classId && 
      searchTerms.some(term => s.name.toLowerCase().includes(term))
    );
    return sub?.id;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveDropdown(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <header className="w-full">
      {/* Top Accessibility Bar */}
      <div className="bg-slate-100 border-b border-slate-200 py-1 text-[11px] font-medium text-slate-600">
        <div className="mx-auto max-w-7xl flex items-center justify-end gap-4 px-4 sm:px-6 lg:px-8">
          <button className="hover:text-ncert-maroon flex items-center gap-1">
            <Globe size={12} /> Language
          </button>
          <button className="hover:text-ncert-maroon flex items-center gap-1">
            <Type size={12} /> Text Size
          </button>
          <button className="hover:text-ncert-maroon flex items-center gap-1">
            <Eye size={12} /> Contrast
          </button>
          <div className="h-3 w-[1px] bg-slate-300 mx-1" />
          <span>{new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Main Maroon Header */}
      <div className="bg-ncert-maroon text-white py-4 shadow-md">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
          <Link to="/" className="flex items-center gap-4 group">
            <div className="bg-white p-2 rounded-full shadow-inner group-hover:scale-105 transition-transform">
              <Globe className="text-ncert-maroon" size={48} />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-xl md:text-2xl font-bold leading-tight tracking-wide">डाकशिक्षा</h1>
              <h2 className="text-lg md:text-xl font-semibold leading-tight opacity-90">DakShiksha</h2>
              <p className="text-[10px] uppercase tracking-[0.2em] opacity-70 mt-1">Postal Educational Knowledge Portal</p>
            </div>
          </Link>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <form onSubmit={handleSearch} className="relative flex-1 md:w-80">
              <input
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full rounded-sm border-none bg-white/10 px-4 pr-10 text-sm text-white placeholder:text-white/50 focus:bg-white focus:text-slate-900 focus:outline-none transition-all"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-white/70 hover:text-white">
                <Search size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Bar */}
      <nav className="bg-[#1a1a1a] border-b border-white/10 sticky top-0 z-40 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="hidden md:flex items-center gap-8 text-[13px] font-bold text-white">
              <Link to="/" className="hover:text-slate-300 transition-colors">HOME</Link>
              
              {examCategories.map((cat) => (
                <Link 
                  key={cat.name} 
                  to={`/exams/${cat.search[0]}`}
                  className="hover:text-slate-300 transition-colors uppercase tracking-wide"
                >
                  {cat.name}
                </Link>
              ))}

              <div className="relative group h-14 flex items-center">
                <button className="hover:text-slate-300 transition-colors flex items-center gap-1 uppercase tracking-wide">
                  MORE <ChevronRight size={14} className="rotate-90 opacity-50" />
                </button>
                <div className="absolute left-0 top-full hidden group-hover:block w-72 bg-[#1a1a1a] shadow-2xl border border-white/5 py-2 z-50">
                  <a 
                    href="https://www.indiapost.gov.in/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block px-6 py-2.5 hover:bg-white/5 text-slate-300 hover:text-white text-sm font-bold transition-colors uppercase"
                  >
                    India Post Website
                  </a>
                  <a 
                    href="https://dhenkanalpostaldivision.org/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block px-6 py-2.5 hover:bg-white/5 text-slate-300 hover:text-white text-sm font-bold transition-colors uppercase"
                  >
                    Dhenkanal Postal Division Website
                  </a>
                  <a 
                    href="https://sites.google.com/view/postal-knowledge/home" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block px-6 py-2.5 hover:bg-white/5 text-slate-300 hover:text-white text-sm font-bold transition-colors uppercase"
                  >
                    BD Branch Website
                  </a>
                  <div className="h-[1px] bg-white/5 my-1" />
                  <Link to="/about" className="block px-6 py-2.5 hover:bg-white/5 text-slate-300 hover:text-white text-sm font-bold transition-colors">ABOUT US</Link>
                  <Link to="/publications" className="block px-6 py-2.5 hover:bg-white/5 text-slate-300 hover:text-white text-sm font-bold transition-colors">PUBLICATIONS</Link>
                  <Link to="/contact" className="block px-6 py-2.5 hover:bg-white/5 text-slate-300 hover:text-white text-sm font-bold transition-colors">CONTACT</Link>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-white hover:text-slate-300"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 p-4 space-y-4 shadow-xl">
            <div className="space-y-2">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="block py-2 font-bold text-slate-700">HOME</Link>
              <div className="py-2">
                <p className="text-xs font-bold text-slate-400 uppercase mb-2">Exams</p>
                <div className="grid grid-cols-2 gap-2">
                  {examCategories.map(cat => (
                    <Link
                      key={cat.name}
                      to={`/exams/${cat.search[0]}`}
                      onClick={() => setIsMenuOpen(false)}
                      className="block p-2 text-sm bg-slate-50 rounded hover:bg-ncert-maroon/5"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
              <Link to="/about" onClick={() => setIsMenuOpen(false)} className="block py-2 font-bold text-slate-700">ABOUT US</Link>
              <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="block py-2 font-bold text-slate-700">CONTACT</Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
