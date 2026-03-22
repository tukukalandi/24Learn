import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot, query, where, doc, getDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import * as Icons from 'lucide-react';
import { ArrowLeft, ChevronRight } from 'lucide-react';

export function ClassView() {
  const { classId } = useParams();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [className, setClassName] = useState('');

  useEffect(() => {
    if (!classId) return;

    // Fetch class name
    const fetchClass = async () => {
      try {
        const classSnap = await getDoc(doc(db, 'classes', classId));
        if (classSnap.exists()) {
          setClassName(classSnap.data().name);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `classes/${classId}`);
      }
    };
    fetchClass();

    // Fetch subjects for this class
    const unsub = onSnapshot(query(collection(db, 'subjects'), where('classId', '==', classId)), (snap) => {
      setSubjects(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'subjects'));
    return () => unsub();
  }, [classId]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Link to="/" className="mb-8 flex items-center gap-2 text-slate-500 hover:text-brand-500 transition-colors">
        <ArrowLeft size={20} />
        <span>Back to Home</span>
      </Link>

      <div className="mb-12">
        <h1 className="font-display text-4xl font-bold text-slate-900">
          {className || `Class ${classId}`}
        </h1>
        <p className="mt-2 text-slate-600">
          Select a subject to view chapters and study materials.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((subject, i) => {
          const Icon = (Icons as any)[subject.icon] || Icons.Book;
          return (
            <motion.div
              key={subject.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                to={`/class/${classId}/subject/${subject.id}`}
                className="group flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-6 transition-all hover:border-brand-500 hover:shadow-xl hover:shadow-brand-500/10"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                    <Icon size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{subject.name}</h3>
                    <p className="text-sm text-slate-500">Explore Chapters</p>
                  </div>
                </div>
                <ChevronRight className="text-slate-300 group-hover:text-brand-500 transition-colors" />
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
