import { motion } from 'motion/react';
import { Trophy, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export function CompetitiveExams() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Link to="/" className="mb-8 flex items-center gap-2 text-slate-500 hover:text-brand-500">
        <ArrowLeft size={20} /> Back to Home
      </Link>
      
      <div className="rounded-3xl border-2 border-brand-200 bg-brand-50 p-12 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-500 text-white">
          <Trophy size={40} />
        </div>
        <h1 className="mb-4 font-display text-4xl font-bold text-slate-900">Competitive Exams</h1>
        <p className="mx-auto max-w-2xl text-lg text-slate-600">
          Prepare for JEE, NEET, UPSC, and other competitive exams with our curated study materials and practice tests.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
        {[
          { title: 'JEE Main & Advanced', desc: 'Comprehensive notes and mock tests for engineering aspirants.' },
          { title: 'NEET UG', desc: 'Detailed biology, physics, and chemistry materials for medical entrance.' },
          { title: 'UPSC / State PSC', desc: 'Current affairs, history, and general studies for civil services.' },
        ].map((exam, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
          >
            <h3 className="text-xl font-bold text-slate-900">{exam.title}</h3>
            <p className="mt-2 text-slate-600">{exam.desc}</p>
            <button className="mt-6 font-bold text-brand-500 hover:text-brand-600">
              Coming Soon →
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
