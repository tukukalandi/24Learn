import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, FileText, PlayCircle, PenTool, Download, CheckCircle2, ChevronRight, Trophy, BookOpen, MessageSquare } from 'lucide-react';
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

  if (loading) return <div className="p-20 text-center text-ncert-maroon font-bold italic animate-pulse">Loading Resources...</div>;
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
    <div className="min-h-screen bg-ncert-bg pb-20">
      {/* NCERT Style Banner */}
      <div className="bg-ncert-maroon/10 py-12 px-4 shadow-sm">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <Link to={`/class/${classId}/subject/${subjectId}`} className="inline-flex items-center gap-2 text-ncert-maroon font-bold text-sm hover:underline">
              <ArrowLeft size={16} /> Back to Chapters
            </Link>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span>{className}</span>
              <ChevronRight size={12} />
              <span>{subjectName}</span>
              <ChevronRight size={12} />
              <span className="text-ncert-maroon">{chapter.title}</span>
            </div>
          </div>
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-ncert-maroon p-2 rounded-sm text-white">
              <BookOpen size={24} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-ncert-maroon italic tracking-tight">
              {chapter.title}
            </h1>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-1 bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
              <div className="bg-ncert-maroon text-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest">
                Resource Menu
              </div>
              {[
                { id: 'docs', icon: FileText, label: 'Documents' },
                { id: 'video', icon: PlayCircle, label: 'Video Tutorial' },
                { id: 'quiz', icon: PenTool, label: 'Practice Quiz' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-4 text-left text-sm font-bold transition-all border-l-4",
                    activeTab === tab.id
                      ? "bg-ncert-maroon/5 text-ncert-maroon border-ncert-maroon"
                      : "text-slate-600 border-transparent hover:bg-slate-50"
                  )}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              ))}
              
              <div className="p-4 bg-slate-50 border-t border-slate-100">
                <button className="flex w-full items-center justify-center gap-2 rounded-sm border-2 border-dashed border-slate-200 py-3 text-xs font-bold text-slate-400 transition-all hover:border-ncert-maroon hover:text-ncert-maroon">
                  <Download size={16} />
                  DOWNLOAD PDF
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-slate-200 p-6 shadow-sm rounded-sm min-h-[600px]">
              <AnimatePresence mode="wait">
                {activeTab === 'docs' && (
                  <motion.div
                    key="docs"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-8"
                  >
                    <div className="border-b border-slate-100 pb-4">
                      <h2 className="text-2xl font-bold text-ncert-maroon italic">Study Materials & Notes</h2>
                      <p className="text-sm text-slate-500 mt-1">Download and review the following documents for this chapter.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {chapter.documents && chapter.documents.length > 0 ? (
                        chapter.documents.map((doc: any, i: number) => (
                          <a
                            key={i}
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between rounded-sm border border-slate-100 bg-slate-50/50 p-4 transition-all hover:border-ncert-maroon hover:bg-white hover:shadow-md group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-white text-ncert-maroon border border-slate-100 shadow-sm group-hover:bg-ncert-maroon group-hover:text-white transition-colors">
                                <FileText size={20} />
                              </div>
                              <div>
                                <p className="font-bold text-slate-800 text-sm">{doc.title}</p>
                                <p className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">{doc.type}</p>
                              </div>
                            </div>
                            <Download size={18} className="text-slate-300 group-hover:text-ncert-maroon" />
                          </a>
                        ))
                      ) : (
                        <div className="col-span-2 py-20 text-center text-slate-400 italic text-sm">
                          No documents uploaded for this chapter yet.
                        </div>
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
                    <div className="border-b border-slate-100 pb-4 mb-8">
                      <h2 className="text-2xl font-bold text-ncert-maroon italic">Video Tutorial</h2>
                      <p className="text-sm text-slate-500 mt-1">Watch the concept clearing video for this chapter.</p>
                    </div>
                    
                    {chapter.videoUrl ? (
                      <div className="aspect-video overflow-hidden rounded-sm bg-slate-100 border-8 border-ncert-maroon/5 shadow-inner">
                        <iframe
                          src={chapter.videoUrl}
                          className="h-full w-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <div className="py-20 text-center text-slate-400 italic text-sm">
                        No video available for this chapter yet.
                      </div>
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
                    <div className="border-b border-slate-100 pb-4 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-bold text-ncert-maroon italic">Chapter Quiz</h2>
                        <p className="text-sm text-slate-500 mt-1">Test your knowledge and earn XP.</p>
                      </div>
                      
                      {!isCompleted ? (
                        <button
                          onClick={handleComplete}
                          className="flex items-center gap-2 rounded-sm bg-ncert-maroon px-6 py-2 text-xs font-bold text-white shadow-lg hover:bg-ncert-maroon/90 transition-all active:scale-95"
                        >
                          <Trophy size={16} />
                          MARK AS COMPLETED (+50 XP)
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 rounded-sm bg-green-50 px-6 py-2 text-xs font-bold text-green-700 border border-green-100">
                          <CheckCircle2 size={16} />
                          COMPLETED!
                        </div>
                      )}
                    </div>
                    
                    {chapter.quizHtml ? (
                      <div 
                        className="quiz-container min-h-[500px] w-full overflow-hidden rounded-sm border border-slate-100 bg-slate-50/30"
                        dangerouslySetInnerHTML={{ __html: chapter.quizHtml }}
                      />
                    ) : (
                      <div className="py-20 text-center text-slate-400 italic text-sm">
                        No quiz content available for this chapter yet.
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Doubt Section */}
              <div className="mt-20 border-t border-slate-100 pt-12">
                <div className="flex items-center gap-2 mb-6">
                  <MessageSquare className="text-ncert-maroon" size={20} />
                  <h3 className="text-xl font-bold text-slate-800 italic">Doubts & Comments</h3>
                </div>
                
                <div className="flex gap-4">
                  <div className="h-10 w-10 shrink-0 rounded-sm bg-ncert-maroon/10 flex items-center justify-center text-ncert-maroon font-bold">
                    {profile?.displayName?.[0] || '?'}
                  </div>
                  <div className="flex-grow">
                    <textarea
                      placeholder="Write your doubt or comment here..."
                      className="w-full rounded-sm border border-slate-200 bg-slate-50/50 p-4 text-sm focus:border-ncert-maroon focus:bg-white focus:outline-none transition-all"
                      rows={3}
                    />
                    <div className="mt-3 flex justify-end">
                      <button className="rounded-sm bg-ncert-maroon px-8 py-2 text-xs font-bold text-white shadow-md hover:bg-ncert-maroon/90 transition-all active:scale-95">
                        POST COMMENT
                      </button>
                    </div>
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
