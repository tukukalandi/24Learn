import { motion } from 'motion/react';
import { Trophy, ArrowLeft, BookOpen, GraduationCap, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

export function CompetitiveExams() {
  return (
    <div className="min-h-screen bg-ncert-bg pb-20">
      {/* NCERT Style Banner */}
      <div className="bg-ncert-maroon/10 py-12 px-4 shadow-sm">
        <div className="mx-auto max-w-7xl">
          <Link to="/" className="inline-flex items-center gap-2 text-ncert-maroon font-bold text-sm mb-4 hover:underline">
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-ncert-maroon p-2 rounded-sm text-white">
              <Trophy size={24} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-ncert-maroon italic tracking-tight">
              Competitive Exams Preparation
            </h1>
          </div>
          <p className="mt-2 text-slate-600 font-medium">
            Prepare for JEE, NEET, UPSC, and other competitive exams with our curated study materials and practice tests.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {[
            { 
              title: 'JEE Main & Advanced', 
              desc: 'Comprehensive notes, previous year papers, and mock tests for engineering aspirants.',
              icon: Target
            },
            { 
              title: 'NEET UG', 
              desc: 'Detailed biology, physics, and chemistry materials for medical entrance exams.',
              icon: GraduationCap
            },
            { 
              title: 'UPSC / State PSC', 
              desc: 'Current affairs, history, general studies, and optional subjects for civil services.',
              icon: BookOpen
            },
          ].map((exam, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white border border-slate-200 rounded-sm p-8 shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="h-12 w-12 bg-ncert-maroon/5 text-ncert-maroon rounded-sm flex items-center justify-center mb-6 group-hover:bg-ncert-maroon group-hover:text-white transition-colors">
                <exam.icon size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 group-hover:text-ncert-maroon transition-colors">{exam.title}</h3>
              <p className="mt-4 text-sm text-slate-500 leading-relaxed">{exam.desc}</p>
              <div className="mt-8 pt-6 border-t border-slate-100">
                <button className="text-xs font-bold text-ncert-maroon uppercase tracking-widest hover:underline">
                  Coming Soon →
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Informational Section */}
        <div className="mt-16 bg-white border border-slate-200 rounded-sm p-8 md:p-12 shadow-sm">
          <h2 className="text-2xl font-bold text-ncert-maroon italic mb-6">Why Choose 24Learn for Competitive Exams?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="font-bold text-slate-800">Expert Curated Content</h4>
              <p className="text-sm text-slate-500">Our study materials are developed by subject matter experts with years of experience in competitive exam coaching.</p>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-slate-800">Comprehensive Question Bank</h4>
              <p className="text-sm text-slate-500">Access thousands of practice questions categorized by difficulty level and topic to strengthen your weak areas.</p>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-slate-800">Real-time Performance Analytics</h4>
              <p className="text-sm text-slate-500">Track your progress with detailed reports and identify topics that need more focus before the actual exam.</p>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-slate-800">Interactive Doubt Solving</h4>
              <p className="text-sm text-slate-500">Get your queries resolved by our community of educators and fellow aspirants through our dedicated doubt portal.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
