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
              Postal Departmental Exams
            </h1>
          </div>
          <p className="mt-2 text-slate-600 font-medium">
            Prepare for GDS to MTS, Postman, PA/SA, and other departmental exams with our specialized study materials.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {[
            { 
              title: 'GDS to MTS', 
              desc: 'Complete syllabus coverage for MTS recruitment exam including PO Guide Part I and General Knowledge.',
              icon: Target
            },
            { 
              title: 'GDS to Postman', 
              desc: 'Detailed resources for Postman/Mail Guard exams covering Postal Manual Vol V and local geography.',
              icon: GraduationCap
            },
            { 
              title: 'PA/SA Exam', 
              desc: 'Advanced study material for Postal Assistant and Sorting Assistant recruitment.',
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
          <h2 className="text-2xl font-bold text-ncert-maroon italic mb-6">Why Choose DakShiksha for Postal Exams?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="font-bold text-slate-800">Specialized Postal Content</h4>
              <p className="text-sm text-slate-500">Our study materials are focused strictly on the Department of Posts syllabus, including PO Guide Part I & II and Postal Manuals.</p>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-slate-800">Targeted Question Bank</h4>
              <p className="text-sm text-slate-500">Access thousands of practice questions based on previous years' departmental exam patterns.</p>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-slate-800">Performance Tracking</h4>
              <p className="text-sm text-slate-500">Evaluate your preparation level with our mock tests designed specifically for GDS and departmental promotions.</p>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-slate-800">Expert Guidance</h4>
              <p className="text-sm text-slate-500">Get insights and tips from experienced postal employees who have successfully cleared these exams.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
