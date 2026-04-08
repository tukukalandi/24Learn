import React from 'react';
import { motion } from 'motion/react';
import { Calculator, BookOpen, FileText, CheckCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AccountantExam() {
  const sections = [
    {
      title: "Paper I: Postal Operations",
      desc: "Post Office Guide Part I, II and Postal Manual Volume V",
      topics: ["PO Guide Part I", "PO Guide Part II", "Postal Manual Vol V", "Foreign Post"]
    },
    {
      title: "Paper II: Accounts & Finance",
      desc: "FHB Volume I & II, Account Code Volume I, II & III",
      topics: ["FHB Vol I", "FHB Vol II", "Account Code Vol I", "Account Code Vol II"]
    }
  ];

  return (
    <div className="min-h-screen bg-postal-bg font-sans">
      <div className="bg-postal-red py-12 text-white">
        <div className="mx-auto max-w-7xl px-4">
          <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors">
            <ArrowLeft size={18} /> Back to Home
          </Link>
          <div className="flex items-center gap-6">
            <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm">
              <Calculator size={48} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Accountant Exam</h1>
              <p className="text-white/80 mt-2">Comprehensive resources for PO Accountant Departmental Examination</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {sections.map((section, i) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden"
              >
                <div className="p-6 border-b border-slate-50">
                  <h2 className="text-xl font-bold text-slate-800">{section.title}</h2>
                  <p className="text-sm text-slate-500 mt-1">{section.desc}</p>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {section.topics.map((topic) => (
                    <div key={topic} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg group hover:bg-postal-red/5 transition-colors cursor-pointer">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm text-postal-red">
                        <BookOpen size={16} />
                      </div>
                      <span className="font-semibold text-slate-700 group-hover:text-postal-red transition-colors">{topic}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <FileText size={18} className="text-postal-red" /> Important Downloads
              </h3>
              <div className="space-y-3">
                {["Syllabus PDF", "Previous Year 2024", "Previous Year 2023", "Study Notes"].map((item) => (
                  <button key={item} className="w-full flex items-center justify-between p-3 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-100 transition-all">
                    {item} <CheckCircle size={14} className="text-green-500" />
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-postal-yellow/10 p-6 rounded-xl border border-postal-yellow/20">
              <h3 className="font-bold text-slate-800 mb-2">Exam Eligibility</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Officials with 3 years of regular service in the cadre of PA/SA are eligible to appear for the PO Accountant Examination.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
