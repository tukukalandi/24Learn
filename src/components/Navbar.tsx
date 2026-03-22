import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, GraduationCap, Trophy, Menu, X, User, LogOut, Settings, ChevronRight } from 'lucide-react';
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

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'classes'), orderBy('order')), (snap) => {
      setClasses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'classes'));
    return () => unsub();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-white shadow-lg shadow-brand-500/20">
              <GraduationCap size={24} />
            </div>
            <span className="font-display text-2xl font-bold tracking-tight text-slate-900">
              24<span className="text-brand-500">Learn</span>
            </span>
          </Link>

          <form onSubmit={handleSearch} className="hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search chapters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-64 rounded-full border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </form>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="hidden items-center gap-2 rounded-full bg-accent-500/10 px-3 py-1.5 sm:flex">
                <Trophy className="h-4 w-4 text-accent-600" />
                <span className="text-sm font-semibold text-accent-600">{profile?.xp || 0} XP</span>
              </div>

              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50"
                  title="Admin Dashboard"
                >
                  <Settings size={20} />
                </Link>
              )}

              <button
                onClick={logout}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50"
                title="Logout"
              >
                <LogOut size={20} />
              </button>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 text-white">
                <User size={20} />
              </div>
            </div>
          ) : (
            <button
              onClick={login}
              className="rounded-full bg-brand-500 px-6 py-2 text-sm font-semibold text-white transition-transform hover:scale-105 active:scale-95"
            >
              Sign In
            </button>
          )}

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 md:hidden"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "absolute left-0 top-16 max-h-[calc(100vh-4rem)] w-full overflow-y-auto border-b border-slate-200 bg-white p-4 transition-all md:hidden",
          isMenuOpen ? "block" : "hidden"
        )}
      >
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search chapters..."
              className="h-10 w-full rounded-full border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
        </form>

        <div className="mb-6 space-y-1">
          <h3 className="mb-2 px-2 text-xs font-bold uppercase tracking-wider text-slate-400">Explore</h3>
          <Link
            to="/competitive-exams"
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold text-slate-900 hover:bg-brand-50 hover:text-brand-600"
          >
            <div className="flex items-center gap-3">
              <Trophy size={18} className="text-brand-500" />
              Competitive Exams
            </div>
            <ChevronRight size={16} className="text-slate-300" />
          </Link>
          
          <div className="mt-4">
            <h3 className="mb-2 px-2 text-xs font-bold uppercase tracking-wider text-slate-400">Classes</h3>
            <div className="grid grid-cols-1 gap-1">
              {classes.map((cls) => (
                <Link
                  key={cls.id}
                  to={`/class/${cls.id}`}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-500"
                >
                  {cls.name}
                  <ChevronRight size={16} className="text-slate-300" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6 space-y-2">
          {user ? (
            <div className="space-y-2">
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 py-3 text-sm font-semibold"
                >
                  <Settings size={18} /> Admin Dashboard
                </Link>
              )}
              <button
                onClick={() => { logout(); setIsMenuOpen(false); }}
                className="w-full rounded-full bg-brand-500 py-3 text-sm font-semibold text-white"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => { login(); setIsMenuOpen(false); }}
              className="w-full rounded-full bg-brand-500 py-3 text-sm font-semibold text-white"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
