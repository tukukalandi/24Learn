import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot, query, where, doc, getDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { ArrowLeft, PlayCircle, FileText, CheckCircle2 } from 'lucide-react';

export function SubjectView() {
  const { classId, subjectId } = useParams();
  const [chapters, setChapters] = useState<any[]>([]);
  const [subjectName, setSubjectName] = useState('');
  const [className, setClassName] = useState('');

  useEffect(() => {
    if (!subjectId || !classId) return;

    // Fetch names
    const fetchNames = async () => {
      try {
        const classSnap = await getDoc(doc(db, 'classes', classId));
        if (classSnap.exists()) setClassName(classSnap.data().name);
        
        const subSnap = await getDoc(doc(db, 'subjects', subjectId));
        if (subSnap.exists()) setSubjectName(subSnap.data().name);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `classes/${classId}`);
      }
    };
    fetchNames();

    // Fetch chapters
    const unsub = onSnapshot(query(collection(db, 'chapters'), where('subjectId', '==', subjectId)), (snap) => {
      setChapters(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'chapters'));
    return () => unsub();
  }, [subjectId, classId]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Link to={`/class/${classId}`} className="mb-8 flex items-center gap-2 text-slate-500 hover:text-brand-500 transition-colors">
        <ArrowLeft size={20} />
        <span>Back to Subjects</span>
      </Link>

      <div className="mb-12">
        <h1 className="font-display text-4xl font-bold text-slate-900">
          {subjectName} - {className}
        </h1>
        <p className="mt-2 text-slate-600">
          Explore chapters and master each topic.
        </p>
      </div>

      <div className="space-y-4">
        {chapters.map((chapter, i) => (
          <motion.div
            key={chapter.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link
              to={`/class/${classId}/subject/${subjectId}/chapter/${chapter.id}`}
              className="group flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 transition-all hover:border-brand-500 hover:shadow-lg sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                  {i + 1}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-500 transition-colors">
                    {chapter.title}
                  </h3>
                  <div className="mt-1 flex items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1"><FileText size={14} /> Notes</span>
                    <span className="flex items-center gap-1"><PlayCircle size={14} /> Video</span>
                    <span className="flex items-center gap-1"><CheckCircle2 size={14} /> Quiz</span>
                  </div>
                </div>
              </div>
              <button className="rounded-full bg-brand-50 px-6 py-2 text-sm font-bold text-brand-600 transition-colors group-hover:bg-brand-500 group-hover:text-white">
                Start Learning
              </button>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
