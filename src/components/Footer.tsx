import { Globe, Github, Twitter, Instagram, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white px-4 py-12 dark:border-slate-800 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-postal-red text-white shadow-lg shadow-postal-red/20">
                <Globe size={24} />
              </div>
              <span className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Dak<span className="text-postal-red">Shiksha</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-slate-600 dark:text-slate-400">
              Your personal guide to mastering postal departmental exams. Empowering postal employees through knowledge.
            </p>
            <div className="mt-6 flex gap-4">
              <a href="#" className="text-slate-400 hover:text-postal-red transition-colors"><Twitter size={20} /></a>
              <a href="#" className="text-slate-400 hover:text-postal-red transition-colors"><Instagram size={20} /></a>
              <a href="#" className="text-slate-400 hover:text-postal-red transition-colors"><Github size={20} /></a>
              <a href="#" className="text-slate-400 hover:text-postal-red transition-colors"><Mail size={20} /></a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white">Quick Links</h4>
            <ul className="mt-4 space-y-2 text-slate-600 dark:text-slate-400">
              <li><Link to="/" className="hover:text-postal-red transition-colors">Home</Link></li>
              <li><Link to="/about" className="hover:text-postal-red transition-colors">About Us</Link></li>
              <li><Link to="/competitive-exams" className="hover:text-postal-red transition-colors">Exams</Link></li>
              <li><Link to="/contact" className="hover:text-postal-red transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white">Legal</h4>
            <ul className="mt-4 space-y-2 text-slate-600 dark:text-slate-400">
              <li><a href="#" className="hover:text-ncert-maroon transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-ncert-maroon transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-ncert-maroon transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 border-t border-slate-100 pt-8 text-center dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} DakShiksha. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
