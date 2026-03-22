import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Video, PenTool, Trophy } from 'lucide-react';

export function Home() {
  const [classes, setClasses] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'classes'), orderBy('order')), (snap) => {
      setClasses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'classes'));
    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10 opacity-30">
          <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-brand-500 blur-[120px]" />
        </div>
        
        <div className="mx-auto max-w-7xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block rounded-full bg-brand-100 px-4 py-1.5 text-sm font-bold text-brand-700">
              Education 24/7
            </span>
            <h1 className="mt-6 font-display text-5xl font-extrabold tracking-tight text-slate-900 sm:text-7xl">
              Ab padhai hogi <span className="text-brand-500">24/7 asaan.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
              24Learn ke saath paiye best notes, interactive videos aur quizzes. 
              Class 1 se 12 tak sab kuch ek hi jagah par.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <button className="rounded-full bg-brand-500 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-brand-500/25 transition-transform hover:scale-105 active:scale-95">
                Start Learning Now
              </button>
              <button className="rounded-full border-2 border-slate-200 px-8 py-4 text-lg font-bold text-slate-900 transition-colors hover:bg-slate-50">
                View Courses
              </button>
            </div>

            {/* Daily Challenge Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="mx-auto mt-16 max-w-md rounded-3xl border border-brand-100 bg-brand-50/50 p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-500 text-white">
                    <Trophy size={20} />
                  </div>
                  <div className="text-left">
                    <h4 className="text-sm font-bold text-slate-900">Daily Challenge</h4>
                    <p className="text-xs text-slate-500">Earn 50 XP today!</p>
                  </div>
                </div>
                <button className="rounded-full bg-white px-4 py-1.5 text-xs font-bold text-brand-600 shadow-sm transition-colors hover:bg-brand-500 hover:text-white">
                  Solve Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-slate-50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              { icon: BookOpen, title: 'Read Notes', desc: 'Expertly crafted notes for quick revision.' },
              { icon: Video, title: 'Watch Videos', desc: 'Concept clearing videos for every chapter.' },
              { icon: PenTool, title: 'Practice Quizzes', desc: 'Test your knowledge with interactive MCQs.' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-3xl bg-white p-8 shadow-sm"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">{feature.title}</h3>
                <p className="mt-2 text-slate-600">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Class Selection Grid */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <h2 className="font-display text-3xl font-bold text-slate-900">Choose Your Class</h2>
              <p className="mt-2 text-slate-600">Select your grade to start exploring subjects.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {/* Competitive Exams Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0 }}
            >
              <Link
                to="/competitive-exams"
                className="group flex h-32 flex-col items-center justify-center rounded-3xl border-2 border-brand-200 bg-brand-50 transition-all hover:border-brand-500 hover:shadow-xl hover:shadow-brand-500/10"
              >
                <Trophy className="mb-1 text-brand-500 group-hover:scale-110 transition-transform" size={32} />
                <span className="text-center text-sm font-bold text-slate-900">
                  Competitive Exams
                </span>
                <div className="mt-2 flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-white transition-colors">
                  <ArrowRight size={14} />
                </div>
              </Link>
            </motion.div>

            {classes.map((cls, i) => (
              <motion.div
                key={cls.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/class/${cls.id}`}
                  className="group flex h-32 flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white transition-all hover:border-brand-500 hover:shadow-xl hover:shadow-brand-500/10"
                >
                  <span className="text-3xl font-bold text-slate-900 group-hover:text-brand-500 transition-colors">
                    {cls.name.replace('Class ', '')}
                  </span>
                  <span className="mt-1 text-sm font-medium text-slate-500">
                    Grade
                  </span>
                  <div className="mt-2 flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-400 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                    <ArrowRight size={14} />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
