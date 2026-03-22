import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, FileText, PlayCircle, PenTool, Download, CheckCircle2, ChevronRight, Trophy } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

export function ChapterView() {
  const { classId, subjectId, chapterId } = useParams();
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'docs' | 'video' | 'quiz'>('docs');
  const [isCompleted, setIsCompleted] = useState(false);
  
  const [chapter, setChapter] = useState<any>(null);
  const [subjectName, setSubjectName] = useState('');
  const [className, setClassName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chapterId || !subjectId || !classId) return;

    const fetchData = async () => {
      try {
        const chapSnap = await getDoc(doc(db, 'chapters', chapterId));
        if (chapSnap.exists()) setChapter(chapSnap.data());

        const subSnap = await getDoc(doc(db, 'subjects', subjectId));
        if (subSnap.exists()) setSubjectName(subSnap.data().name);

        const classSnap = await getDoc(doc(db, 'classes', classId));
        if (classSnap.exists()) setClassName(classSnap.data().name);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `chapters/${chapterId}`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [chapterId, subjectId, classId]);

  if (loading) return <div className="p-20 text-center">Loading Chapter...</div>;
  if (!chapter) return <div className="p-20 text-center">Chapter not found</div>;

  const handleComplete = async () => {
    if (isCompleted || !profile?.uid) return;
    try {
      await updateDoc(doc(db, 'users', profile.uid), {
        xp: increment(50)
      });
      setIsCompleted(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${profile.uid}`);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link to={`/class/${classId}/subject/${subjectId}`} className="flex items-center gap-2 text-slate-500 hover:text-brand-500 transition-colors">
          <ArrowLeft size={20} />
          <span>Back to Chapters</span>
        </Link>
        <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
          <span>{className}</span>
          <ChevronRight size={14} />
          <span>{subjectName}</span>
          <ChevronRight size={14} />
          <span className="text-slate-900">{chapter.title}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-2">
            {[
              { id: 'docs', icon: FileText, label: 'Documents' },
              { id: 'video', icon: PlayCircle, label: 'Watch Video' },
              { id: 'quiz', icon: PenTool, label: 'Practice Quiz' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl px-4 py-4 text-left font-bold transition-all",
                  activeTab === tab.id
                    ? "bg-brand-500 text-white shadow-lg shadow-brand-500/20"
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                <tab.icon size={20} />
                {tab.label}
              </button>
            ))}
            
            <button className="mt-8 flex w-full items-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 px-4 py-4 text-left font-bold text-slate-500 transition-all hover:border-brand-500 hover:text-brand-500">
              <Download size={20} />
              Download PDF
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
            <AnimatePresence mode="wait">
              {activeTab === 'docs' && (
                <motion.div
                  key="docs"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <h2 className="font-display text-3xl font-bold text-slate-900">Study Materials</h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {chapter.documents && chapter.documents.length > 0 ? (
                      chapter.documents.map((doc: any, i: number) => (
                        <a
                          key={i}
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-all hover:border-brand-500 hover:bg-brand-50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-brand-500 shadow-sm">
                              <FileText size={20} />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{doc.title}</p>
                              <p className="text-xs uppercase text-slate-500 font-medium">{doc.type}</p>
                            </div>
                          </div>
                          <Download size={18} className="text-slate-400" />
                        </a>
                      ))
                    ) : (
                      <div className="col-span-2 py-12 text-center text-slate-500">No documents uploaded for this chapter.</div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'video' && (
                <motion.div
                  key="video"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <h2 className="mb-6 font-display text-3xl font-bold text-slate-900">Video Tutorial</h2>
                  {chapter.videoUrl ? (
                    <div className="aspect-video overflow-hidden rounded-3xl bg-slate-100">
                      <iframe
                        src={chapter.videoUrl}
                        className="h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="py-20 text-center text-slate-500">No video available for this chapter.</div>
                  )}
                </motion.div>
              )}

              {activeTab === 'quiz' && (
                <motion.div
                  key="quiz"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="font-display text-3xl font-bold text-slate-900">Chapter Quiz</h2>
                    {!isCompleted && (
                      <button
                        onClick={handleComplete}
                        className="flex items-center gap-2 rounded-full bg-brand-500 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-brand-500/20 transition-transform hover:scale-105 active:scale-95"
                      >
                        <Trophy size={16} />
                        Mark as Completed (+50 XP)
                      </button>
                    )}
                    {isCompleted && (
                      <div className="flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-700">
                        <CheckCircle2 size={16} />
                        Completed!
                      </div>
                    )}
                  </div>
                  
                  {chapter.quizHtml ? (
                    <div 
                      className="quiz-container min-h-[500px] w-full overflow-hidden rounded-2xl border border-slate-100"
                      dangerouslySetInnerHTML={{ __html: chapter.quizHtml }}
                    />
                  ) : (
                    <div className="py-20 text-center text-slate-500">No quiz content available for this chapter yet.</div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Doubt Section */}
            <div className="mt-12 border-t border-slate-100 pt-12">
              <h3 className="font-display text-2xl font-bold text-slate-900">Doubts & Comments</h3>
              <p className="mt-2 text-slate-600">Have a question? Ask our community or teachers.</p>
              
              <div className="mt-6 flex gap-4">
                <div className="h-10 w-10 shrink-0 rounded-full bg-slate-200" />
                <div className="flex-grow">
                  <textarea
                    placeholder="Write your doubt here..."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm focus:border-brand-500 focus:outline-none"
                    rows={3}
                  />
                  <div className="mt-2 flex justify-end">
                    <button className="rounded-full bg-brand-500 px-6 py-2 text-sm font-bold text-white shadow-lg shadow-brand-500/20 transition-transform hover:scale-105 active:scale-95">
                      Post Doubt
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
