import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import Fuse from 'fuse.js';
import { motion } from 'motion/react';
import { Search, Book, BookOpen, GraduationCap, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface SearchItem {
  id: string;
  type: 'class' | 'subject' | 'chapter';
  title: string;
  subtitle?: string;
  link: string;
  classId?: string;
  subjectId?: string;
}

export function SearchResults() {
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const [loading, setLoading] = useState(true);
  const [allItems, setAllItems] = useState<SearchItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [classesSnap, subjectsSnap, chaptersSnap] = await Promise.all([
          getDocs(collection(db, 'classes')),
          getDocs(collection(db, 'subjects')),
          getDocs(collection(db, 'chapters'))
        ]);

        const classes: SearchItem[] = classesSnap.docs.map(doc => ({
          id: doc.id,
          type: 'class',
          title: doc.data().name,
          link: `/class/${doc.id}`
        }));

        const subjects: SearchItem[] = subjectsSnap.docs.map(doc => {
          const data = doc.data();
          const className = classes.find(c => c.id === data.classId)?.title || '';
          return {
            id: doc.id,
            type: 'subject',
            title: data.name,
            subtitle: className,
            link: `/class/${data.classId}/subject/${doc.id}`,
            classId: data.classId
          };
        });

        const chapters: SearchItem[] = chaptersSnap.docs.map(doc => {
          const data = doc.data();
          const subject = subjects.find(s => s.id === data.subjectId);
          const subjectName = subject?.title || '';
          const className = classes.find(c => c.id === data.classId)?.title || '';
          return {
            id: doc.id,
            type: 'chapter',
            title: data.title || data.name,
            subtitle: `${className} • ${subjectName}`,
            link: `/class/${data.classId}/subject/${data.subjectId}/chapter/${doc.id}`,
            classId: data.classId,
            subjectId: data.subjectId
          };
        });

        setAllItems([...classes, ...subjects, ...chapters]);
      } catch (error) {
        console.error('Search data fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fuse = useMemo(() => {
    return new Fuse(allItems, {
      keys: ['title', 'subtitle'],
      threshold: 0.3,
      includeScore: true
    });
  }, [allItems]);

  const results = useMemo(() => {
    if (!queryParam) return [];
    return fuse.search(queryParam).map(r => r.item);
  }, [fuse, queryParam]);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Search className="text-postal-red" />
            Search Results for "{queryParam}"
          </h1>
          <p className="text-slate-500 mt-2">
            {loading ? 'Searching through materials...' : `Found ${results.length} results`}
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="animate-spin mb-4" size={48} />
            <p className="font-medium">Indexing study materials...</p>
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-4">
            {results.map((item, i) => (
              <motion.div
                key={`${item.type}-${item.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={item.link}
                  className="group flex items-center gap-4 p-5 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-postal-red/30 transition-all"
                >
                  <div className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center shrink-0",
                    item.type === 'class' ? "bg-blue-50 text-blue-600" :
                    item.type === 'subject' ? "bg-emerald-50 text-emerald-600" :
                    "bg-amber-50 text-amber-600"
                  )}>
                    {item.type === 'class' ? <GraduationCap size={24} /> :
                     item.type === 'subject' ? <Book size={24} /> :
                     <BookOpen size={24} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                        item.type === 'class' ? "bg-blue-100 text-blue-700" :
                        item.type === 'subject' ? "bg-emerald-100 text-emerald-700" :
                        "bg-amber-100 text-amber-700"
                      )}>
                        {item.type}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 group-hover:text-postal-red transition-colors truncate">
                      {item.title}
                    </h3>
                    {item.subtitle && (
                      <p className="text-sm text-slate-500 truncate">
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="text-slate-300 group-hover:text-postal-red transition-colors" />
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search size={40} className="text-slate-300" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">No results found</h2>
            <p className="text-slate-500 max-w-sm mx-auto">
              We couldn't find any materials matching your search. Try using different keywords or check for typos.
            </p>
            <Link to="/" className="inline-block mt-8 text-postal-red font-bold hover:underline">
              Back to Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
