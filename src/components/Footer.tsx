import { GraduationCap, Github, Twitter, Instagram, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white px-4 py-12 dark:border-slate-800 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-white shadow-lg shadow-brand-500/20">
                <GraduationCap size={24} />
              </div>
              <span className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                24<span className="text-brand-500">Learn</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-slate-600 dark:text-slate-400">
              Making education accessible 24/7. Quality notes, videos, and practice quizzes for students across India.
            </p>
            <div className="mt-6 flex gap-4">
              <a href="#" className="text-slate-400 hover:text-brand-500 transition-colors"><Twitter size={20} /></a>
              <a href="#" className="text-slate-400 hover:text-brand-500 transition-colors"><Instagram size={20} /></a>
              <a href="#" className="text-slate-400 hover:text-brand-500 transition-colors"><Github size={20} /></a>
              <a href="#" className="text-slate-400 hover:text-brand-500 transition-colors"><Mail size={20} /></a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white">Quick Links</h4>
            <ul className="mt-4 space-y-2 text-slate-600 dark:text-slate-400">
              <li><Link to="/" className="hover:text-brand-500 transition-colors">Home</Link></li>
              <li><a href="#" className="hover:text-brand-500 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-brand-500 transition-colors">Courses</a></li>
              <li><a href="#" className="hover:text-brand-500 transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white">Legal</h4>
            <ul className="mt-4 space-y-2 text-slate-600 dark:text-slate-400">
              <li><a href="#" className="hover:text-brand-500 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-brand-500 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-brand-500 transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 border-t border-slate-100 pt-8 text-center dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} 24Learn. All rights reserved. Made with ❤️ for students.
          </p>
        </div>
      </div>
    </footer>
  );
}
