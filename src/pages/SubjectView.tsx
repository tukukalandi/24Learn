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

    const unsub = onSnapshot(query(collection(db, 'chapters'), where('subjectId', '==', subjectId)), (snap) => {
      setChapters(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'chapters'));
    return () => unsub();
  }, [subjectId, classId]);

  const materials = [
    { 
      name: "NCERT NEW BOOK", 
      icon: BookOpen,
      color: "bg-rose-500",
      link: (classId?.includes('4') && (subjectId?.toLowerCase().includes("math") || subjectName.toLowerCase().includes("math"))) 
        ? "https://ncert.nic.in/textbook.php?demm1=0-14" 
        : undefined
    },
    { name: "BOOK SOLUTION", icon: FileText, color: "bg-amber-500" },
    { name: "CHAPTER WISE PPT", icon: PlayCircle, color: "bg-emerald-500" },
    { name: "WORKSHEET", icon: FileText, color: "bg-sky-500" },
    { name: "ONLINE QUIZ", icon: CheckCircle2, color: "bg-indigo-500" },
    { name: "CYCLE TEST", icon: CheckCircle2, color: "bg-fuchsia-500" },
    { name: "VIDEO LESSON", icon: PlayCircle, color: "bg-orange-500" },
    { name: "AUDIO LESSON", icon: PlayCircle, color: "bg-teal-500" },
    { name: "ACTIVITY", icon: PlayCircle, color: "bg-blue-500" },
    { name: "LESSON PLAN", icon: FileText, color: "bg-purple-500" },
    { name: "LESSON PLAN BASED ON KVS HQ NEW FORMAT", icon: FileText, color: "bg-pink-500" },
    { name: "SPLIT-UP SYLLABUS", icon: FileText, color: "bg-cyan-500" },
  ];

  const mathClass4Chapters = [
    "Chapter 1 Shapes Around Us Class 4",
    "Chapter 2 Hide and Seek Class 4",
    "Chapter 3 Pattern Around Us Class 4",
    "Chapter 4 Thousands Around Us Class 4",
    "Chapter 5 Sharing and Measuring Class 4",
    "Chapter 6 Measuring Length Class 4",
    "Chapter 7 The Cleanest Village Class 4",
    "Chapter 8 Weigh it, Pour it Class 4",
    "Chapter 9 Equal Groups Class 4",
    "Chapter 10 Elephants, Tigers, and Leopards Class 4",
    "Chapter 11 Fun with Symmetry Class 4",
    "Chapter 12 Ticking Clocks and Turning Calendar Class 4",
    "Chapter 13 The Transport Museum Class 4",
    "Chapter 14 Data Handling Class 4"
  ];

  const englishClass4Chapters = [
    "Chapter 1 Together We Can Class 4",
    "Chapter 2 The Tinkling Bells Class 4",
    "Chapter 3 Be Smart, Be Safe Class 4",
    "Chapter 4 One Thing at a Time Class 4",
    "Chapter 5 The Old Stag Class 4",
    "Chapter 6 Braille Class 4",
    "Chapter 7 Fit Body, Fit Mind, Fit Nation Class 4",
    "Chapter 8 The Lagori Champions Class 4",
    "Chapter 9 Hekko Class 4",
    "Chapter 10 The Swing Class 4",
    "Chapter 11 A Journey to the Magical Mountains Class 4",
    "Chapter 12 Maheshwar Class 4"
  ];

  const normalizedSubjectId = subjectId?.toLowerCase() || '';
  const normalizedSubjectName = subjectName.toLowerCase();
  const normalizedClassId = classId?.toLowerCase() || '';
  
  const isMath = normalizedSubjectId.includes('math') || normalizedSubjectName.includes('math');
  const isEnglish = normalizedSubjectId.includes('english') || normalizedSubjectId.includes('eng') || normalizedSubjectName.includes('english');
  const isClass4 = normalizedClassId.includes('4');

  const isMathClass4 = isClass4 && isMath;
  const isEnglishClass4 = isClass4 && isEnglish;
  
  const showChapters = isMathClass4 || isEnglishClass4;
  const currentChapters = isMathClass4 ? mathClass4Chapters : (isEnglishClass4 ? englishClass4Chapters : []);

  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);

  useEffect(() => {
    if (showChapters && !selectedMaterial) {
      setSelectedMaterial("NCERT NEW BOOK");
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
            <ArrowLeft size={16} /> Back to Subjects
          </Link>

          <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-2 tracking-tight">
            Material Link
          </h1>
          <p className="text-slate-500 text-lg">
            {subjectName} TextBook Material Link
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {materials.map((item, i) => {
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
            className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden scroll-mt-10"
            id="chapters-section"
          >
            <div className="bg-ncert-maroon text-white px-10 py-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
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
            
            <div className="p-8 md:p-10 bg-slate-50/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentChapters.map((chapter, index) => (
                  <motion.div 
                    key={chapter}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    className="group flex items-center gap-5 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-ncert-maroon transition-all cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-ncert-maroon font-black text-xl group-hover:bg-ncert-maroon group-hover:text-white transition-all shrink-0 shadow-inner">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-700 group-hover:text-slate-900 leading-tight">
                        {chapter}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs font-bold text-ncert-maroon uppercase tracking-wider">View Details</span>
                        <ChevronRight size={14} className="text-ncert-maroon" />
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-ncert-maroon/10 group-hover:text-ncert-maroon transition-all">
                      <ChevronRight size={18} />
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
