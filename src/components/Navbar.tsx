import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, GraduationCap, Trophy, Menu, X, User, LogOut, Settings, ChevronRight, Globe, Type, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { cn } from '../lib/utils';

export function Navbar() {
  const { user, profile, isAdmin, login, logout } = useAuth();
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

  const mainSubjects = [
    { name: 'हिन्दी', search: ['hindi', 'हिन्दी'] },
    { name: 'ENGLISH', search: ['english'] },
    { name: 'MATH\'S', search: ['math', 'mathematics', 'गणित'] },
    { name: 'TWAU', search: ['twau'] },
    { name: 'SCIENCE', search: ['science', 'विज्ञान'] },
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
              <GraduationCap className="text-ncert-maroon" size={48} />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-xl md:text-2xl font-bold leading-tight tracking-wide">२४लर्न</h1>
              <h2 className="text-lg md:text-xl font-semibold leading-tight opacity-90">24Learn</h2>
              <p className="text-[10px] uppercase tracking-[0.2em] opacity-70 mt-1">Educational Research and Training Portal</p>
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

            <div className="flex items-center gap-2">
              {user ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={logout}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                    title="Logout"
                  >
                    <LogOut size={20} />
                  </button>
                  <div className="h-10 w-10 flex items-center justify-center rounded-full bg-white text-ncert-maroon font-bold">
                    {profile?.displayName?.[0] || user.email?.[0].toUpperCase()}
                  </div>
                </div>
              ) : (
                <button
                  onClick={login}
                  className="bg-white text-ncert-maroon px-6 py-2 rounded-sm text-sm font-bold hover:bg-slate-100 transition-colors"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Bar */}
      <nav className="bg-[#1a1a1a] border-b border-white/10 sticky top-0 z-40 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="hidden md:flex items-center gap-8 text-[13px] font-bold text-white">
              <Link to="/" className="hover:text-slate-300 transition-colors">HOME</Link>
              
              {mainSubjects.map((sub) => (
                <div 
                  key={sub.name} 
                  className="relative h-14 flex items-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button 
                    onClick={() => setActiveDropdown(activeDropdown === sub.name ? null : sub.name)}
                    className={cn(
                      "hover:text-slate-300 transition-colors flex items-center gap-1 uppercase tracking-wide",
                      activeDropdown === sub.name && "text-white"
                    )}
                  >
                    {sub.name} <ChevronRight size={14} className={cn("transition-transform duration-200", activeDropdown === sub.name ? "-rotate-90" : "rotate-90 opacity-50")} />
                  </button>
                  
                  {activeDropdown === sub.name && (
                    <div className="absolute left-0 top-full w-44 bg-[#1a1a1a] shadow-2xl border border-white/5 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                      {/* Classes 1-12 */}
                      {[...Array(12)].map((_, i) => {
                        const className = `Class ${i + 1}`;
                        const cls = classes.find(c => c.name === className);
                        const subjectId = cls ? getSubjectIdForClass(cls.id, sub.search) : null;
                        
                        // Use the real ID if it exists, otherwise use a formatted slug as a fallback
                        const fallbackClassId = className.toLowerCase().replace(' ', '-');
                        const targetClassId = cls ? cls.id : fallbackClassId;
                        
                        // Use the real subject ID if it exists, otherwise use the search term as a fallback
                        const targetSubjectId = (cls && subjectId) ? subjectId : sub.search[0].toLowerCase();
                        
                        return (
                          <Link
                            key={className}
                            to={`/class/${targetClassId}/subject/${targetSubjectId}`}
                            className="block px-6 py-2.5 text-sm font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                            onClick={() => setActiveDropdown(null)}
                          >
                            {className}
                          </Link>
                        );
                      })}
                      
                      <div className="h-[1px] bg-white/5 my-1" />
                      <Link
                        to="/competitive-exams"
                        className="block px-6 py-2.5 hover:bg-white/5 text-ncert-maroon hover:text-red-400 text-sm font-bold transition-colors"
                        onClick={() => setActiveDropdown(null)}
                      >
                        Competitive Exams
                      </Link>
                    </div>
                  )}
                </div>
              ))}

              <div className="relative group h-14 flex items-center">
                <button className="hover:text-slate-300 transition-colors flex items-center gap-1 uppercase tracking-wide">
                  MORE <ChevronRight size={14} className="rotate-90 opacity-50" />
                </button>
                <div className="absolute left-0 top-full hidden group-hover:block w-48 bg-[#1a1a1a] shadow-2xl border border-white/5 py-2 z-50">
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

            {user && (
              <div className="flex items-center gap-2 text-xs font-bold text-white bg-white/10 px-3 py-1 rounded-full border border-white/10">
                <Trophy size={14} />
                <span>{profile?.xp || 0} XP</span>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 p-4 space-y-4 shadow-xl">
            <div className="space-y-2">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="block py-2 font-bold text-slate-700">HOME</Link>
              <div className="py-2">
                <p className="text-xs font-bold text-slate-400 uppercase mb-2">Classes</p>
                <div className="grid grid-cols-2 gap-2">
                  {classes.map(cls => (
                    <Link
                      key={cls.id}
                      to={`/class/${cls.id}`}
                      onClick={() => setIsMenuOpen(false)}
                      className="block p-2 text-sm bg-slate-50 rounded hover:bg-ncert-maroon/5"
                    >
                      {cls.name}
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
