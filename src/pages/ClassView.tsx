import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot, query, where, doc, getDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import * as Icons from 'lucide-react';
import { ArrowLeft, ChevronRight, BookOpen, GraduationCap } from 'lucide-react';

export function ClassView() {
  const { classId } = useParams();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [className, setClassName] = useState('');

  useEffect(() => {
    if (!classId) return;

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

    const unsub = onSnapshot(query(collection(db, 'subjects'), where('classId', '==', classId)), (snap) => {
      setSubjects(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'subjects'));
    return () => unsub();
  }, [classId]);

  return (
    <div className="min-h-screen bg-ncert-bg pb-20">
      {/* NCERT Style Banner */}
      <div className="bg-ncert-maroon/10 py-12 px-4 shadow-sm">
        <div className="mx-auto max-w-7xl">
          <Link to="/" className="inline-flex items-center gap-2 text-ncert-maroon font-bold text-sm mb-4 hover:underline">
            <ArrowLeft size={16} /> Back to Portal
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-ncert-maroon italic tracking-tight">
            {className || `Exam Category ${classId}`} - Study Material
          </h1>
          <p className="mt-2 text-slate-600 font-medium">
            Select a topic or paper to access digital study materials and resources.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {subjects.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {subjects.map((subject, i) => (
              <motion.div
                key={subject.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/class/${classId}/subject/${subject.id}`}
                  className="group block bg-white border border-slate-200 p-4 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1"
                >
                  <div className="aspect-[3/4] overflow-hidden bg-slate-100 mb-4 border-4 border-ncert-maroon/5">
                    <img 
                      src={subject.thumbnail || `https://picsum.photos/seed/${subject.id}/300/400`}
                      alt={subject.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-bold text-ncert-maroon leading-tight group-hover:underline">{subject.name}</h3>
                      <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">Study Material</p>
                    </div>
                    <div className="bg-ncert-maroon/10 p-1 rounded-sm text-ncert-maroon">
                      <BookOpen size={16} />
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-xs font-bold text-slate-400">
                    <span>{className}</span>
                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white shadow-sm border border-slate-100 rounded-sm">
            <GraduationCap size={48} className="mx-auto text-slate-200 mb-4" />
            <h3 className="text-xl font-bold text-slate-400 italic">No materials available for this category yet.</h3>
          </div>
        )}
      </div>
    </div>
  );
}
