import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, Menu, X, ChevronRight, Globe, Type, Eye, 
  Mail, Briefcase, Stamp, Package, Users, MoreHorizontal,
  UserCircle, FileText, Download, Calendar, ArrowLeft
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { cn } from '../lib/utils';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isBranchMenuOpen, setIsBranchMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [classes, setClasses] = useState<any[]>([]);
  const navigate = useNavigate();

  const [subjectsList, setSubjectsList] = useState<any[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const location = useLocation();
  const isHome = location.pathname === '/';

  // BD Branch Auth State
  const [showBDAuth, setShowBDAuth] = useState(false);
  const [bdUserId, setBdUserId] = useState('');
  const [bdPassword, setBdPassword] = useState('');
  const [bdError, setBdError] = useState('');

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

  const branches = [
    { name: 'Mail Branch', icon: Mail },
    { name: 'BD Branch', icon: Briefcase },
    { name: 'Savings Branch', icon: Package },
    { name: 'Philately Branch', icon: Stamp },
    { name: 'Parcel Branch', icon: Package },
    { name: 'CCS Branch', icon: Users },
    { name: 'Other Branch', icon: MoreHorizontal },
  ];

  const extraMenuOptions = [
    { name: 'Staff Corner', icon: UserCircle, link: '/staff-corner' },
    { name: 'Latest Circulars', icon: FileText, link: '/circulars' },
    { name: 'Download Forms', icon: Download, link: '/forms' },
    { name: 'Holiday Calendar', icon: Calendar, link: '/holidays' },
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

  const handleBDAuth = (e: React.FormEvent) => {
    e.preventDefault();
    const userIdRegex = /^1\d{7}$/;
    if (userIdRegex.test(bdUserId) && bdPassword === 'Dop@1234') {
      window.open('https://sites.google.com/view/postal-knowledge/home', '_blank');
      setShowBDAuth(false);
      setBdUserId('');
      setBdPassword('');
      setBdError('');
    } else {
      setBdError('Invalid User ID or Password. User ID must be 8 digits starting with 1.');
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      setActiveDropdown(null);
      // Close branch menu if clicking outside
      const target = e.target as HTMLElement;
      if (!target.closest('.branch-menu-container')) {
        setIsBranchMenuOpen(false);
      }
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <header className="w-full">
      {/* Top Accessibility Bar (Language Bar) */}
      <div className="bg-postal-dark-maroon border-b border-white/10 py-1 text-[11px] font-medium text-white">
        <div className="mx-auto max-w-7xl flex items-center justify-end gap-4 px-4 sm:px-6 lg:px-8">
          <button className="hover:text-postal-yellow flex items-center gap-1">
            <Globe size={12} /> Language
          </button>
          <button className="hover:text-postal-yellow flex items-center gap-1">
            <Type size={12} /> Text Size
          </button>
          <button className="hover:text-postal-yellow flex items-center gap-1">
            <Eye size={12} /> Contrast
          </button>
          <div className="h-3 w-[1px] bg-white/30 mx-1" />
          <span>{new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Main Branding Header (Dark Red) */}
      <div className="bg-postal-branding text-white py-4 shadow-sm relative border-b border-white/10">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            {!isHome && (
              <button 
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white md:hidden"
                aria-label="Go Back"
              >
                <ArrowLeft size={24} />
              </button>
            )}
            <div className="bg-white p-1 rounded-sm shadow-sm flex items-center justify-center">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" 
                alt="Indian National Emblem" 
                className="h-14 w-auto"
                referrerPolicy="no-referrer"
              />
            </div>
            {/* Branch Menu Button */}
            <div className="branch-menu-container relative">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsBranchMenuOpen(!isBranchMenuOpen);
                }}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-postal-yellow"
                aria-label="Toggle Branch Menu"
              >
                {isBranchMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>

              {/* Branch Side Menu */}
              {isBranchMenuOpen && (
                <div className="absolute left-0 top-full mt-4 w-64 bg-white text-slate-900 shadow-2xl rounded-sm border border-slate-200 z-[100] overflow-hidden animate-in slide-in-from-left duration-200">
                  <div className="bg-postal-red p-4 text-white">
                    <h3 className="font-bold text-lg">My Branches</h3>
                    <p className="text-[10px] opacity-70 uppercase tracking-widest">Select a branch to explore</p>
                  </div>
                  <div className="py-2">
                    {branches.map((branch) => {
                      const isExternal = branch.name === 'Philately Branch';
                      const link = branch.name === 'BD Branch' ? '/branch/bd' : 
                                   branch.name === 'Savings Branch' ? '/branch/savings' : 
                                   branch.name === 'Other Branch' ? '/branch/other' : '#';
                      
                      if (isExternal) {
                        return (
                          <a
                            key={branch.name}
                            href="https://philately.vercel.app/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-sm font-semibold text-slate-700 transition-colors border-b border-slate-50 last:border-0"
                            onClick={() => setIsBranchMenuOpen(false)}
                          >
                            <branch.icon size={18} className="text-postal-red" />
                            {branch.name}
                          </a>
                        );
                      }

                      return (
                        <Link
                          key={branch.name}
                          to={link}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-sm font-semibold text-slate-700 transition-colors border-b border-slate-50 last:border-0"
                          onClick={() => setIsBranchMenuOpen(false)}
                        >
                          <branch.icon size={18} className="text-postal-red" />
                          {branch.name}
                        </Link>
                      );
                    })}
                  </div>
                  <div className="bg-slate-50 p-3 border-t border-slate-200">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Quick Access</h4>
                    <div className="space-y-1">
                      {extraMenuOptions.map((option) => (
                        <Link
                          key={option.name}
                          to={option.link}
                          className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-slate-600 hover:text-postal-red transition-colors"
                          onClick={() => setIsBranchMenuOpen(false)}
                        >
                          <option.icon size={14} />
                          {option.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link to="/" className="flex items-center gap-4 group">
              <div className="text-center md:text-left">
                <h1 className="text-xl md:text-2xl font-bold leading-tight tracking-wide text-white">डाकशिक्षा</h1>
                <h2 className="text-lg md:text-xl font-semibold leading-tight text-white">DakShiksha</h2>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/80 mt-1">Postal Educational Knowledge Portal</p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <form onSubmit={handleSearch} className="relative flex-1 md:w-80">
              <input
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full rounded-sm border border-white/20 bg-white/10 px-4 pr-10 text-sm text-white placeholder:text-white/50 focus:bg-white/20 focus:border-postal-yellow focus:outline-none transition-all"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 hover:text-postal-yellow">
                <Search size={18} />
              </button>
            </form>
            <div className="bg-white p-1 rounded-sm shadow-sm flex items-center justify-center">
              <img 
                src="https://upload.wikimedia.org/wikipedia/en/3/32/India_Post.svg" 
                alt="India Post Logo" 
                className="h-14 w-auto"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Bar (India Post Red) */}
      <nav className="bg-postal-red sticky top-0 z-40 shadow-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            <div className="hidden md:flex items-center gap-10 text-[13px] font-bold text-white">
              <Link to="/" className="hover:text-postal-yellow transition-colors tracking-widest">HOME</Link>
              <Link to="/rules" className="hover:text-postal-yellow transition-colors tracking-widest">RULES</Link>
              <Link to="/exams/po-guide" className="hover:text-postal-yellow transition-colors tracking-widest">GUIDES</Link>
              <a 
                href="https://app.indiapost.gov.in/idam/realms/indiapost/protocol/openid-connect/auth?response_type=code&client_id=internal_client&redirect_uri=https%3A%2F%2Fapp.indiapost.gov.in%2Fmisreports%2Fapi%2Fauth%2Fcallback%2Fkeycloak&nextauth=keycloak&code_challenge=DYh9BEOftOFrXgjvcqOuqaIWX2dvEdA4BimdY_o0RKM&code_challenge_method=S256&scope=openid+profile+email" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-postal-yellow transition-colors tracking-widest uppercase"
              >
                APT 2.0
              </a>
              
              <div className="relative group h-12 flex items-center">
                <button className="hover:text-postal-yellow transition-colors flex items-center gap-1 tracking-widest uppercase">
                  OTHERS <ChevronRight size={14} className="rotate-90 opacity-50" />
                </button>
                <div className="absolute left-0 top-full hidden group-hover:block w-72 bg-white shadow-2xl border border-slate-200 py-2 z-50">
                  <a 
                    href="https://www.indiapost.gov.in/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block px-6 py-2.5 hover:bg-slate-50 text-slate-700 hover:text-postal-red text-sm font-bold transition-colors uppercase"
                  >
                    India Post Website
                  </a>
                  <a 
                    href="https://dhenkanalpostaldivision.org/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block px-6 py-2.5 hover:bg-slate-50 text-slate-700 hover:text-postal-red text-sm font-bold transition-colors uppercase"
                  >
                    Dhenkanal Postal Division Website
                  </a>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      setShowBDAuth(true);
                    }}
                    className="w-full text-left block px-6 py-2.5 hover:bg-slate-50 text-slate-700 hover:text-postal-red text-sm font-bold transition-colors uppercase"
                  >
                    BD Branch Website
                  </button>
                  <div className="h-[1px] bg-slate-100 my-1" />
                  <Link to="/about" className="block px-6 py-2.5 hover:bg-slate-50 text-slate-700 hover:text-postal-red text-sm font-bold transition-colors">ABOUT US</Link>
                  <a 
                    href="https://officedirectorydkldvn.edgeone.app/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block px-6 py-2.5 hover:bg-slate-50 text-slate-700 hover:text-postal-red text-sm font-bold transition-colors uppercase"
                  >
                    Office Directory
                  </a>
                  <Link to="/contact" className="block px-6 py-2.5 hover:bg-slate-50 text-slate-700 hover:text-postal-red text-sm font-bold transition-colors">CONTACT</Link>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-white hover:text-postal-yellow"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 p-4 space-y-4 shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="space-y-2">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 py-2 font-bold text-postal-red border-b border-slate-50">
                <ArrowLeft size={16} /> BACK TO HOME
              </Link>
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="block py-2 font-bold text-slate-700 border-b border-slate-50">HOME</Link>
              <Link to="/rules" onClick={() => setIsMenuOpen(false)} className="block py-2 font-bold text-slate-700 border-b border-slate-50">RULES</Link>
              <Link to="/exams/po-guide" onClick={() => setIsMenuOpen(false)} className="block py-2 font-bold text-slate-700 border-b border-slate-50">GUIDES</Link>
              <a 
                href="https://app.indiapost.gov.in/idam/realms/indiapost/protocol/openid-connect/auth?response_type=code&client_id=internal_client&redirect_uri=https%3A%2F%2Fapp.indiapost.gov.in%2Fmisreports%2Fapi%2Fauth%2Fcallback%2Fkeycloak&nextauth=keycloak&code_challenge=DYh9BEOftOFrXgjvcqOuqaIWX2dvEdA4BimdY_o0RKM&code_challenge_method=S256&scope=openid+profile+email" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block py-2 font-bold text-slate-700 border-b border-slate-50"
                onClick={() => setIsMenuOpen(false)}
              >
                APT 2.0
              </a>
              
              <div className="py-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Others</p>
                <div className="space-y-1 pl-2 border-l-2 border-postal-red/10">
                  <a 
                    href="https://www.indiapost.gov.in/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block py-2 text-sm font-semibold text-slate-600 hover:text-postal-red"
                  >
                    India Post Website
                  </a>
                  <a 
                    href="https://dhenkanalpostaldivision.org/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block py-2 text-sm font-semibold text-slate-600 hover:text-postal-red"
                  >
                    Dhenkanal Postal Division Website
                  </a>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      setIsMenuOpen(false);
                      setShowBDAuth(true);
                    }}
                    className="w-full text-left block py-2 text-sm font-semibold text-slate-600 hover:text-postal-red"
                  >
                    BD Branch Website
                  </button>
                  <a 
                    href="https://officedirectorydkldvn.edgeone.app/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block py-2 text-sm font-semibold text-slate-600 hover:text-postal-red"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    OFFICE DIRECTORY
                  </a>
                  <Link to="/about" onClick={() => setIsMenuOpen(false)} className="block py-2 text-sm font-semibold text-slate-600 hover:text-postal-red">ABOUT US</Link>
                  <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="block py-2 text-sm font-semibold text-slate-600 hover:text-postal-red">CONTACT</Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* BD Branch Auth Modal */}
      {showBDAuth && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-postal-red p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">BD Branch Login</h3>
                <p className="text-xs opacity-80">Restricted Access Portal</p>
              </div>
              <button 
                onClick={() => setShowBDAuth(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleBDAuth} className="p-6 space-y-4">
              {bdError && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-medium rounded">
                  {bdError}
                </div>
              )}
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">User ID</label>
                <input 
                  type="text"
                  value={bdUserId}
                  onChange={(e) => setBdUserId(e.target.value)}
                  className="w-full h-11 px-4 rounded border border-slate-200 focus:border-postal-red focus:ring-1 focus:ring-postal-red outline-none transition-all text-sm"
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Password</label>
                <input 
                  type="password"
                  placeholder="••••••••"
                  value={bdPassword}
                  onChange={(e) => setBdPassword(e.target.value)}
                  className="w-full h-11 px-4 rounded border border-slate-200 focus:border-postal-red focus:ring-1 focus:ring-postal-red outline-none transition-all text-sm"
                  required
                />
              </div>
              
              <button 
                type="submit"
                className="w-full h-12 bg-postal-red text-white font-bold rounded shadow-lg hover:bg-red-700 transition-all active:scale-[0.98] mt-2"
              >
                Access Website
              </button>
            </form>
            
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 text-center">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest leading-relaxed">
                Unauthorized access is prohibited. <br />
                Please contact your administrator for credentials.
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
