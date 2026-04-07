import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot, query, where, doc, getDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { ArrowLeft, PlayCircle, FileText, CheckCircle2, ChevronRight, BookOpen } from 'lucide-react';
import { cn } from '../lib/utils';

export function SubjectView() {
  const { classId, subjectId } = useParams();
  const [chapters, setChapters] = useState<any[]>([]);
  const [subjectName, setSubjectName] = useState('');
  const [className, setClassName] = useState('');

  useEffect(() => {
    if (!subjectId || !classId) return;

    const fetchNames = async () => {
      try {
        // Try to fetch from DB
        const classSnap = await getDoc(doc(db, 'classes', classId));
        if (classSnap.exists()) {
          setClassName(classSnap.data().name);
        } else {
          // Fallback: Parse from slug (e.g., "class-1" -> "Class 1")
          const name = classId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
          setClassName(name);
        }
        
        const subSnap = await getDoc(doc(db, 'subjects', subjectId));
        if (subSnap.exists()) {
          setSubjectName(subSnap.data().name);
        } else {
          // Fallback: Capitalize slug (e.g., "english" -> "English")
          const name = subjectId.charAt(0).toUpperCase() + subjectId.slice(1);
          setSubjectName(name);
        }
      } catch (error) {
        // If it's a real ID that failed, we still want fallbacks
        const cName = classId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        const sName = subjectId.charAt(0).toUpperCase() + subjectId.slice(1);
        setClassName(cName);
        setSubjectName(sName);
      }
    };
    fetchNames();

    const unsub = onSnapshot(query(
      collection(db, 'chapters'), 
      where('subjectId', '==', subjectId),
      where('classId', '==', classId)
    ), (snap) => {
      setChapters(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'chapters'));
    return () => unsub();
  }, [subjectId, classId]);

  const materialsList: { name: string; icon: any; color: string; link?: string }[] = [
    { name: "PREVIOUS YEAR PAPERS", icon: FileText, color: "bg-rose-500" },
    { name: "MOCK TESTS", icon: CheckCircle2, color: "bg-amber-500" },
    { name: "TOPIC NOTES", icon: BookOpen, color: "bg-emerald-500" },
    { name: "VIDEO LECTURES", icon: PlayCircle, color: "bg-sky-500" },
    { name: "PDF DOWNLOADS", icon: FileText, color: "bg-indigo-500" },
    { name: "DAILY QUIZ", icon: CheckCircle2, color: "bg-fuchsia-500" },
    { name: "POSTAL MANUALS", icon: BookOpen, color: "bg-orange-500" },
    { name: "PO GUIDE NOTES", icon: FileText, color: "bg-teal-500" },
    { name: "EXAM SYLLABUS", icon: FileText, color: "bg-blue-500" },
  ];

  const showChapters = chapters.length > 0;
  const currentChapters = chapters;

  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);

  useEffect(() => {
    if (showChapters && !selectedMaterial) {
      setSelectedMaterial("PREVIOUS YEAR PAPERS");
    }
  }, [showChapters, selectedMaterial]);

  const handleMaterialClick = (name: string) => {
    setSelectedMaterial(name);
    // Smooth scroll to chapters section
    setTimeout(() => {
      const element = document.getElementById('chapters-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="text-center mb-12">
          <Link to={`/class/${classId}`} className="inline-flex items-center gap-2 text-ncert-maroon font-bold text-sm mb-8 hover:underline">
            <ArrowLeft size={16} /> Back to Topics
          </Link>

          <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-2 tracking-tight">
            {className} {subjectName}
          </h1>
          <p className="text-slate-500 text-lg">
            Study Material & Resource Links
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {materialsList.map((item, i) => {
            const isSelected = selectedMaterial === item.name;
            const commonClasses = cn(
              "group relative flex flex-col items-center justify-center p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 text-white font-bold text-center h-48 cursor-pointer overflow-hidden",
              item.color,
              isSelected && "ring-4 ring-ncert-maroon ring-offset-4 scale-[1.02]"
            );
            const Icon = item.icon;
            
            if (item.link) {
              return (
                <motion.a
                  key={item.name}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleMaterialClick(item.name)}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className={commonClasses}
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Icon size={80} />
                  </div>
                  <Icon size={32} className="mb-4 group-hover:scale-110 transition-transform" />
                  <span className="text-lg leading-tight uppercase tracking-wide z-10">
                    {item.name}
                  </span>
                </motion.a>
              );
            }
            
            return (
              <motion.button
                key={item.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => handleMaterialClick(item.name)}
                className={commonClasses}
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Icon size={80} />
                </div>
                <Icon size={32} className="mb-4 group-hover:scale-110 transition-transform" />
                <span className="text-lg leading-tight uppercase tracking-wide z-10">
                  {item.name}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Chapters Section for Math/English Class 4 */}
        {showChapters && selectedMaterial && (
          <motion.div 
            key={selectedMaterial}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[1.5rem] shadow-xl border border-slate-200 overflow-hidden scroll-mt-10"
            id="chapters-section"
          >
            <div className="bg-ncert-maroon text-white px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tight flex items-center gap-3">
                  <BookOpen className="text-white/80" />
                  {selectedMaterial}
                </h2>
                <p className="text-white/70 font-medium mt-1">
                  Select a chapter to view its {selectedMaterial.toLowerCase()}
                </p>
              </div>
              <div className="px-6 py-2 bg-white/20 backdrop-blur-md rounded-full text-sm font-black uppercase tracking-widest border border-white/10">
                {currentChapters.length} Chapters
              </div>
            </div>
            
            <div className="p-6 md:p-8 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentChapters.map((chapter, index) => (
                  <motion.div 
                    key={chapter.id || index}
                    whileHover={{ scale: 1.01, x: 2 }}
                    whileTap={{ scale: 0.99 }}
                    className="group flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-ncert-maroon/30 transition-all cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-xl bg-blue-50/80 flex items-center justify-center text-ncert-maroon font-black text-xl shrink-0 border border-blue-100/50">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base md:text-lg font-bold text-slate-700 group-hover:text-slate-900 leading-tight">
                        {chapter.title || chapter.name || chapter}
                      </h3>
                    </div>
                    <div className="text-slate-300 group-hover:text-ncert-maroon transition-colors">
                      <ChevronRight size={20} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
