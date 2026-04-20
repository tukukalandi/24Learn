import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calculator, BookOpen, FileText, CheckCircle, ArrowLeft, 
  Info, Award, GraduationCap, CheckSquare, Square, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

const syllabusData = {
  p1p1: {
    title: "Part I: Service Rules",
    items: [
      "FRs 1 to 56", 
      "SRs 1 to 203", 
      "CCS (Joining Time) Rules 1979", 
      { name: "CCS (Leave) Rules 1972", link: "https://leave-rules.vercel.app/" },
      "CCS (Pension) Rules 1972 / NPS", 
      "GPF (CS) Rules 1960"
    ]
  },
  p1p2: {
    title: "Part II: Allowances & GDS",
    items: [
      "Dearness Allowance (DA)", 
      "House Rent Allowance (HRA)", 
      "City Compensatory Allowance (CCA)", 
      { name: "Children Education Allowance (CEA)", link: "https://children-education-allowance.vercel.app/" },
      "GDS Service Rules (Sec III, VI, VII, IX, XI)"
    ]
  },
  p2p1: {
    title: "Part I: FHB & SAP Manuals",
    items: ["FHB Volume I & II", "Postal Manual Vol II (Ch IV, V, VII-X, XII)", "Schedule of Financial Powers (DoP)", "CSI Manual (SAP) - Finance & Accounts", "CSI Manual (SAP) - HR Payroll Management"]
  },
  p2p2: {
    title: "Part II: PM VI & Benefits",
    items: ["Postal Manual Vol VI Part I, II, VII, XII, XVI, XVII", "PM Vol VI Pt II (MOS, IPOS, BPOS)", "Overtime Allowance (OTA)", "Medical Reimbursement / CGHS", "HBA, LTC & Group Insurance", "Procurement (GFR, GeM Handbook)"]
  }
};

export function AccountantExam() {
  const [activeTab, setActiveTab] = useState<'syllabus' | 'pattern' | 'calculator' | 'documents'>('syllabus');
  const [calcData, setCalcData] = useState({
    category: 'OC',
    p1: '',
    p2: ''
  });
  const [calcResult, setCalcResult] = useState<any>(null);

  const calculateResult = () => {
    const p1 = parseFloat(calcData.p1) || 0;
    const p2 = parseFloat(calcData.p2) || 0;
    const total = p1 + p2;
    const avg = total / 2;

    const limits = calcData.category === 'OC' 
      ? { paper: 45, aggregate: 50 } 
      : { paper: 38, aggregate: 43 };

    const p1Pass = p1 >= limits.paper;
    const p2Pass = p2 >= limits.paper;
    const aggPass = avg >= limits.aggregate;
    
    setCalcResult({
      p1, p2, avg, p1Pass, p2Pass, aggPass,
      passed: p1Pass && p2Pass && aggPass,
      exemption: p1 >= 60 || p2 >= 60
    });
  };

  const documents = [
    { name: 'Official Syllabus (PDF)', year: '2024', type: 'Syllabus' },
    { name: 'Previous Year Question Paper', year: '2024', type: 'PYQ' },
    { name: 'Previous Year Question Paper', year: '2023', type: 'PYQ' },
    { name: 'Previous Year Question Paper', year: '2022', type: 'PYQ' },
    { name: 'Previous Year Question Paper', year: '2021', type: 'PYQ' },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-20">
      {/* Header */}
      <header className="bg-postal-red text-white py-12 px-4 shadow-lg mb-8 border-b-4 border-postal-yellow relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="max-w-5xl mx-auto relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors font-medium">
            <ArrowLeft size={18} /> Back to Home
          </Link>
          <div className="text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-3 uppercase tracking-tight">PO & RMS Accountant Exam</h1>
            <p className="text-postal-yellow text-lg md:text-xl font-medium">Official Syllabus & Exam Guide</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 space-y-8">
        {/* Quick Summary Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-postal-red">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="text-postal-red" size={20} />
              <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Exam Structure</h3>
            </div>
            <p className="text-xl font-bold text-slate-800">2 Papers (With Books)</p>
            <p className="text-sm text-slate-500">3 Hours duration each</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-postal-yellow">
            <div className="flex items-center gap-3 mb-2">
              <Award className="text-postal-yellow" size={20} />
              <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Marking Scheme</h3>
            </div>
            <p className="text-xl font-bold text-slate-800">100 Marks / Paper</p>
            <p className="text-sm text-slate-500">1/3 Theory | 2/3 Practical</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-slate-800">
            <div className="flex items-center gap-3 mb-2">
              <GraduationCap className="text-slate-800" size={20} />
              <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Exemption Rule</h3>
            </div>
            <p className="text-xl font-bold text-slate-800">60% Score</p>
            <p className="text-sm text-slate-500">Valid for 2 subsequent exams</p>
          </div>
        </section>

        {/* Tabs Navigation */}
        <div className="flex flex-wrap border-b border-slate-200 bg-white rounded-t-xl px-2">
          {[
            { id: 'syllabus', label: 'Syllabus', icon: BookOpen },
            { id: 'pattern', label: 'Detailed Pattern', icon: Info },
            { id: 'calculator', label: 'Qualifying Calculator', icon: Calculator },
            { id: 'documents', label: 'Documents', icon: FileText }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-4 font-bold transition-all border-b-2 ${
                activeTab === tab.id 
                  ? 'border-postal-red text-postal-red' 
                  : 'border-transparent text-slate-500 hover:text-postal-red'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white p-6 md:p-8 rounded-b-xl shadow-sm border border-t-0 border-slate-100 min-h-[400px]">
          <AnimatePresence mode="wait">
            {activeTab === 'syllabus' && (
              <motion.div
                key="syllabus"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-8"
              >
                {/* Paper I Section */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
                  <div className="bg-red-50 p-4 border-b border-red-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-red-900">Paper I: Rules & Allowances</h2>
                    <span className="bg-postal-yellow text-red-900 font-bold text-xs px-3 py-1 rounded-full shadow-sm">100 Marks</span>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {['p1p1', 'p1p2'].map((key) => (
                      <div key={key}>
                        <h3 className="font-bold text-slate-700 mb-4 flex items-center">
                          <span className="w-2 h-2 bg-postal-red rounded-full mr-2"></span> 
                          {(syllabusData as any)[key].title}
                        </h3>
                        <ul className="space-y-3">
                          {(syllabusData as any)[key].items.map((item: any, idx: number) => {
                            const isObject = typeof item === 'object';
                            const name = isObject ? item.name : item;
                            const link = isObject ? item.link : null;

                            return (
                              <li key={idx} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-red-50 transition group">
                                <div className="mt-1 text-postal-red">
                                  <ChevronRight size={16} />
                                </div>
                                {link ? (
                                  <a 
                                    href={link} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-postal-red text-sm md:text-base font-medium hover:underline flex items-center gap-1"
                                  >
                                    {name}
                                    <FileText size={14} className="opacity-50" />
                                  </a>
                                ) : (
                                  <span className="text-slate-700 text-sm md:text-base transition-all group-hover:text-postal-red">
                                    {name}
                                  </span>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Paper II Section */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
                  <div className="bg-yellow-50 p-4 border-b border-yellow-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-red-900">Paper II: Manuals & Financial Powers</h2>
                    <span className="bg-postal-red text-white font-bold text-xs px-3 py-1 rounded-full shadow-sm">100 Marks</span>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {['p2p1', 'p2p2'].map((key) => (
                      <div key={key}>
                        <h3 className="font-bold text-slate-700 mb-4 flex items-center">
                          <span className="w-2 h-2 bg-postal-red rounded-full mr-2"></span> 
                          {(syllabusData as any)[key].title}
                        </h3>
                        <ul className="space-y-3">
                          {(syllabusData as any)[key].items.map((item: any, idx: number) => {
                            const isObject = typeof item === 'object';
                            const name = isObject ? item.name : item;
                            const link = isObject ? item.link : null;

                            return (
                              <li key={idx} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-red-50 transition group">
                                <div className="mt-1 text-postal-red">
                                  <ChevronRight size={16} />
                                </div>
                                {link ? (
                                  <a 
                                    href={link} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-postal-red text-sm md:text-base font-medium hover:underline flex items-center gap-1"
                                  >
                                    {name}
                                    <FileText size={14} className="opacity-50" />
                                  </a>
                                ) : (
                                  <span className="text-slate-700 text-sm md:text-base transition-all group-hover:text-postal-red">
                                    {name}
                                  </span>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'pattern' && (
              <motion.div
                key="pattern"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-8"
              >
                <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b pb-4">Examination Standards</h2>
                <div className="space-y-8">
                  <div className="flex items-start bg-slate-50 p-6 rounded-xl border border-slate-100">
                    <div className="bg-red-100 p-3 rounded-lg mr-4 text-2xl">📖</div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-lg mb-1">Mode of Exam</h4>
                      <p className="text-slate-600 leading-relaxed">Candidates are allowed to use books for both papers. The focus is on the application of rules rather than rote memorization.</p>
                    </div>
                  </div>
                  <div className="flex items-start bg-slate-50 p-6 rounded-xl border border-slate-100">
                    <div className="bg-yellow-100 p-3 rounded-lg mr-4 text-2xl">⚖️</div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-lg mb-1">Question Weightage</h4>
                      <div className="text-slate-600 space-y-2 mt-2">
                        <p className="flex items-center gap-2"><ChevronRight size={16} className="text-postal-red" /> <span className="font-semibold text-postal-red">Theoretical (30%):</span> 1/3rd of the marks.</p>
                        <p className="flex items-center gap-2"><ChevronRight size={16} className="text-postal-red" /> <span className="font-semibold text-postal-red">Practical (70%):</span> 2/3rd of the marks.</p>
                        <p className="text-sm italic mt-2">Compulsory questions will be included in both segments.</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start bg-slate-50 p-6 rounded-xl border border-slate-100">
                    <div className="bg-red-100 p-3 rounded-lg mr-4 text-2xl">🏅</div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-lg mb-1">Passing Criteria</h4>
                      <div className="text-slate-600 space-y-3 mt-2">
                        <div className="bg-white p-4 rounded-lg border border-slate-200">
                          <p className="font-bold text-slate-800 mb-1">General (OC):</p>
                          <p>45% in each paper, 50% Aggregate.</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-slate-200">
                          <p className="font-bold text-slate-800 mb-1">SC/ST:</p>
                          <p>38% in each paper, 43% Aggregate.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'calculator' && (
              <motion.div
                key="calculator"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-8"
              >
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Qualifying Marks Calculator</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                      <select 
                        value={calcData.category}
                        onChange={(e) => setCalcData({ ...calcData, category: e.target.value })}
                        className="w-full p-3 border border-slate-200 rounded-lg bg-slate-50 focus:ring-2 focus:ring-postal-red focus:border-postal-red outline-none transition-all"
                      >
                        <option value="OC">Open Category (OC)</option>
                        <option value="SCST">SC / ST Category</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Paper I Marks (out of 100)</label>
                      <input 
                        type="number" 
                        value={calcData.p1}
                        onChange={(e) => setCalcData({ ...calcData, p1: e.target.value })}
                        placeholder="Enter marks" 
                        className="w-full p-3 border border-slate-200 rounded-lg bg-slate-50 focus:ring-2 focus:ring-postal-red focus:border-postal-red outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Paper II Marks (out of 100)</label>
                      <input 
                        type="number" 
                        value={calcData.p2}
                        onChange={(e) => setCalcData({ ...calcData, p2: e.target.value })}
                        placeholder="Enter marks" 
                        className="w-full p-3 border border-slate-200 rounded-lg bg-slate-50 focus:ring-2 focus:ring-postal-red focus:border-postal-red outline-none transition-all"
                      />
                    </div>
                    <button 
                      onClick={calculateResult}
                      className="w-full bg-postal-red text-white py-4 rounded-lg font-bold hover:bg-red-700 transition shadow-lg active:scale-[0.98]"
                    >
                      Check Result
                    </button>
                  </div>
                  
                  <div className={`p-8 rounded-2xl flex flex-col justify-center items-center border-2 transition-all duration-500 ${
                    calcResult 
                      ? (calcResult.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200') 
                      : 'bg-slate-50 border-dashed border-slate-200'
                  }`}>
                    {!calcResult ? (
                      <div className="text-center">
                        <Calculator size={48} className="text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-400 italic">Enter marks to see result</p>
                      </div>
                    ) : (
                      <div className="text-center w-full">
                        <div className={`text-5xl font-black mb-4 ${calcResult.passed ? 'text-green-600' : 'text-red-600'}`}>
                          {calcResult.passed ? 'PASS' : 'FAIL'}
                        </div>
                        <p className={`text-lg font-medium mb-8 ${calcResult.passed ? 'text-green-700' : 'text-red-700'}`}>
                          {calcResult.passed ? 'Congratulations! You meet all criteria.' : 'You did not meet the qualifying criteria.'}
                        </p>

                        <div className="space-y-4 text-left w-full max-w-xs mx-auto bg-white/50 p-6 rounded-xl backdrop-blur-sm border border-white/50">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-600 font-medium">Paper I ({calcResult.p1}):</span> 
                            <span className={`font-bold ${calcResult.p1Pass ? 'text-green-600' : 'text-red-600'}`}>
                              {calcResult.p1Pass ? '✓' : '✗'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-600 font-medium">Paper II ({calcResult.p2}):</span> 
                            <span className={`font-bold ${calcResult.p2Pass ? 'text-green-600' : 'text-red-600'}`}>
                              {calcResult.p2Pass ? '✓' : '✗'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center border-t border-slate-200 pt-4 mt-4 font-bold text-slate-800">
                            <span>Aggregate ({calcResult.avg}%):</span> 
                            <span className={calcResult.aggPass ? 'text-green-600' : 'text-red-600'}>
                              {calcResult.aggPass ? '✓' : '✗'}
                            </span>
                          </div>
                        </div>

                        {calcResult.exemption && (
                          <div className="mt-8 p-4 bg-postal-red/10 rounded-xl text-postal-red text-sm border border-postal-red/20 flex gap-3 items-start text-left">
                            <Award className="shrink-0 mt-0.5" size={18} />
                            <p>
                              <strong>Exemption Alert:</strong> You have scored 60%+ in a paper. You are eligible for exemption in that paper for the next two subsequent examinations.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'documents' && (
              <motion.div
                key="documents"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-8"
              >
                <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b pb-4">Study Documents & PYQs</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {documents.map((doc, idx) => (
                    <motion.div 
                      key={idx} 
                      whileHover={{ scale: 1.02 }}
                      className="bg-white p-6 rounded-2xl border-2 border-slate-100 flex items-center justify-between group hover:border-postal-red hover:shadow-[0_10px_30px_-10px_rgba(231,24,37,0.3)] transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-5">
                        <div className={cn(
                          "w-16 h-16 rounded-2xl flex items-center justify-center transition-colors shadow-inner",
                          doc.type === 'Syllabus' ? 'bg-red-50 text-postal-red group-hover:bg-postal-red group-hover:text-white' : 'bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white'
                        )}>
                          <FileText size={32} />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-lg group-hover:text-postal-red transition-colors">{doc.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={cn(
                              "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest",
                              doc.type === 'Syllabus' ? 'bg-red-100 text-postal-red' : 'bg-amber-100 text-amber-700'
                            )}>
                              {doc.type}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">EY:{doc.year}</span>
                          </div>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-postal-red group-hover:text-white transition-all transform group-hover:translate-x-1">
                        <ChevronRight size={20} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
