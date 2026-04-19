import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, ExternalLink, ChevronRight, 
  ArrowLeft, Search, Filter, BookOpen,
  Download, Clock, Tag, LayoutPanelLeft
} from 'lucide-react';
import { cn } from '../lib/utils';

interface PortalDoc {
  id: string;
  category: string;
  subType: string;
  name: string;
  description: string;
  link: string;
  createdAt: any;
}

const CATEGORY_MAP: Record<string, string> = {
  'mts': 'GDS to MTS',
  'postman': 'Postman Exam',
  'pa': 'PA/SA Exam',
  'lgo': 'LGO Exam',
  'inspector': 'IP Exam',
  'po-guide': 'PO Guide',
  'manuals': 'Postal Manuals',
  'accountant': 'Accountant Exam'
};

export function PublicPortal() {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const [documents, setDocuments] = useState<PortalDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubType, setSelectedSubType] = useState<string | null>(null);
  
  const categoryName = CATEGORY_MAP[categorySlug || ''] || categorySlug;

  useEffect(() => {
    if (!categoryName) return;

    const q = query(
      collection(db, 'portal_documents'),
      where('category', '==', categoryName),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PortalDoc[];
      setDocuments(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [categoryName]);

  const filteredDocs = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.subType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedDocs = filteredDocs.reduce((acc, doc) => {
    if (!acc[doc.subType]) {
      acc[doc.subType] = [];
    }
    acc[doc.subType].push(doc);
    return acc;
  }, {} as Record<string, PortalDoc[]>);

  const subTypes = Object.keys(groupedDocs).sort();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-postal-red"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={() => selectedSubType ? setSelectedSubType(null) : undefined}
              className={cn(
                "inline-flex items-center text-sm transition-colors group",
                selectedSubType ? "text-postal-red font-bold hover:underline" : "text-slate-500 hover:text-postal-red"
              )}
            >
              <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
              {selectedSubType ? "Back to Sub-Types" : <Link to="/">Back to Home</Link>}
            </button>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-postal-red/10 text-postal-red text-xs font-bold rounded-full uppercase tracking-wider">
                  {selectedSubType ? "Documents" : "Resource Portal"}
                </span>
              </div>
              <h1 className="text-4xl font-display font-bold text-slate-900 leading-tight">
                {selectedSubType ? selectedSubType : categoryName}
              </h1>
              {!selectedSubType && (
                <p className="text-slate-600 mt-2 max-w-2xl">
                  Select a category below to explore curated study materials for the {categoryName}.
                </p>
              )}
            </div>

            <div className="relative w-full md:w-80 search-container">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder={selectedSubType ? "Search documents..." : "Search categories..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-postal-red/20 focus:border-postal-red transition-all shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        {subTypes.length > 0 ? (
          <AnimatePresence mode="wait">
            {!selectedSubType ? (
              // Sub-Type Cards Grid
              <motion.div 
                key="subtypes"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {subTypes.map((subType) => (
                  <motion.div
                    key={subType}
                    whileHover={{ y: -5 }}
                    onClick={() => setSelectedSubType(subType)}
                    className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-postal-red transition-all cursor-pointer group"
                  >
                    <div className="w-12 h-12 bg-postal-red/5 rounded-xl flex items-center justify-center text-postal-red mb-6 group-hover:bg-postal-red group-hover:text-white transition-colors">
                      <LayoutPanelLeft size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-postal-red transition-colors">
                      {subType}
                    </h3>
                    <p className="text-slate-500 text-sm">
                      {groupedDocs[subType].length} {groupedDocs[subType].length === 1 ? 'Resource' : 'Resources'} available
                    </p>
                    <div className="mt-6 flex items-center text-xs font-bold text-postal-red uppercase tracking-widest gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      View Documents <ChevronRight size={14} />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              // Documents List for Selected Sub-Type
              <motion.div 
                key="documents"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {groupedDocs[selectedSubType]?.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-postal-red hover:shadow-xl transition-all h-full flex flex-col group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-slate-50 rounded-xl text-postal-red">
                        <FileText size={24} />
                      </div>
                      <a 
                        href={doc.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-slate-400 hover:text-postal-red transition-colors"
                      >
                        <ExternalLink size={20} />
                      </a>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight">
                      {doc.name}
                    </h3>
                    
                    {doc.description && (
                      <p className="text-slate-600 text-sm mb-6 line-clamp-3 italic">
                        {doc.description}
                      </p>
                    )}

                    <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                        <Clock size={12} className="mr-1" />
                        {doc.createdAt?.toDate().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </div>
                      <a 
                        href={doc.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-postal-red hover:underline flex items-center gap-1"
                      >
                        VIEW FILE <ChevronRight size={14} />
                      </a>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border border-slate-200 border-dashed">
            <div className="inline-flex p-6 bg-slate-50 rounded-full text-slate-300 mb-4">
              <Search size={48} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">No resources found</h3>
            <p className="text-slate-500 mt-2">
              {searchQuery ? 'Try adjusting your search query' : `We haven't uploaded any documents for ${categoryName} yet.`}
            </p>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="mt-6 px-6 py-2 bg-postal-red text-white rounded-full font-bold text-sm hover:bg-postal-red/90 transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
