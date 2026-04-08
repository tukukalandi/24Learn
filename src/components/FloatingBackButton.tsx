import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function FloatingBackButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <AnimatePresence>
      {!isHome && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          className="fixed bottom-8 right-8 z-[100] flex flex-col gap-3"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-14 h-14 bg-white text-postal-red rounded-full shadow-2xl border border-slate-100 hover:bg-slate-50 transition-all active:scale-90 group"
            title="Go Back"
          >
            <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center w-14 h-14 bg-postal-red text-white rounded-full shadow-2xl hover:bg-red-700 transition-all active:scale-90 group"
            title="Back to Home"
          >
            <Home size={24} className="group-hover:scale-110 transition-transform" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
