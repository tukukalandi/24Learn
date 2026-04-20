import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, ExternalLink, ChevronRight, 
  ArrowLeft, Search, Filter, BookOpen,
  Download, Clock, Tag, LayoutPanelLeft,
  FileBadge, FileJson, FileType
} from 'lucide-react';
import { cn } from '../lib/utils';

// Helper to determine file type from URL
function getFileTypeInfo(url: string) {
  const extension = url.split(/[#?]/)[0].split('.').pop()?.toLowerCase();
  
  if (extension === 'pdf') return { label: 'PDF DOCUMENT', color: 'text-red-600', bgColor: 'bg-red-50' };
  if (['doc', 'docx'].includes(extension || '')) return { label: 'WORD DOC', color: 'text-blue-600', bgColor: 'bg-blue-50' };
  if (['xls', 'xlsx', 'csv'].includes(extension || '')) return { label: 'SPREADSHEET', color: 'text-emerald-600', bgColor: 'bg-emerald-50' };
  if (url.includes('drive.google.com')) return { label: 'GOOGLE DRIVE', color: 'text-indigo-600', bgColor: 'bg-indigo-50' };
  
  return { label: 'RESOURCE FILE', color: 'text-postal-red', bgColor: 'bg-postal-red/5' };
}

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

const CARD_COLORS = [
  { bg: 'bg-[#e53935]', dark: 'bg-[#c62828]', shadow: 'shadow-red-500/20' }, // Red
  { bg: 'bg-[#00897b]', dark: 'bg-[#00695c]', shadow: 'shadow-teal-500/20' }, // Teal
  { bg: 'bg-[#5e35b1]', dark: 'bg-[#4527a0]', shadow: 'shadow-purple-500/20' }, // Purple
  { bg: 'bg-[#1e88e5]', dark: 'bg-[#1565c0]', shadow: 'shadow-blue-500/20' }, // Blue
  { bg: 'bg-[#fb8c00]', dark: 'bg-[#ef6c00]', shadow: 'shadow-orange-500/20' }, // Orange
  { bg: 'bg-[#d8a100]', dark: 'bg-[#b78a00]', shadow: 'shadow-amber-500/20' }, // Amber
  { bg: 'bg-[#43a047]', dark: 'bg-[#2e7d32]', shadow: 'shadow-green-500/20' }, // Green
  { bg: 'bg-[#8e24aa]', dark: 'bg-[#6a1b9a]', shadow: 'shadow-fuchsia-500/20' }, // Deep Purple
];

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
                {subTypes.map((subType, i) => {
                  const color = CARD_COLORS[i % CARD_COLORS.length];
                  return (
                    <motion.div
                      key={subType}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedSubType(subType)}
                      className={cn(
                        "flex items-stretch overflow-hidden rounded-md shadow-md transition-all cursor-pointer h-20 group",
                        color.bg,
                        color.shadow
                      )}
                    >
                      <div className={cn("w-16 flex items-center justify-center shrink-0 border-r border-white/10", color.dark)}>
                        <div className="bg-white/95 p-2 rounded-full shadow-inner text-slate-700">
                          <LayoutPanelLeft size={18} />
                        </div>
                      </div>
                      <div className="flex-1 p-3 flex flex-col justify-center min-w-0">
                        <h3 className="text-white font-black text-sm uppercase tracking-tight truncate leading-tight group-hover:underline decoration-white/30 underline-offset-2">
                          {subType}
                        </h3>
                        <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                          {groupedDocs[subType].length} Resources
                        </p>
                      </div>
                      <div className="px-3 flex items-center text-white/40 group-hover:text-white transition-colors">
                        <ChevronRight size={16} />
                      </div>
                    </motion.div>
                  );
                })}
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
                {groupedDocs[selectedSubType]?.map((doc, i) => {
                  const typeInfo = getFileTypeInfo(doc.link);
                  const color = CARD_COLORS[i % CARD_COLORS.length];
                  
                  return (
                    <motion.a
                      key={doc.id}
                      href={doc.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        "flex items-stretch overflow-hidden rounded-md shadow-md transition-all cursor-pointer h-24 group relative",
                        color.bg,
                        color.shadow
                      )}
                    >
                      {/* Left Icon Section */}
                      <div className={cn("w-20 sm:w-24 flex items-center justify-center shrink-0 border-r border-white/10", color.dark)}>
                        <div className="bg-white/95 p-3 rounded-full shadow-lg text-slate-700 transform group-hover:scale-110 group-hover:rotate-6 transition-transform">
                          <FileText size={22} />
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="flex-1 p-4 flex flex-col justify-center min-w-0 pr-10">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[8px] font-black uppercase tracking-[0.2em] bg-white/20 px-2 py-0.5 rounded text-white border border-white/10">
                            {typeInfo.label}
                          </span>
                        </div>
                        <h3 className="text-white font-black text-sm sm:text-base uppercase tracking-tight truncate leading-tight group-hover:underline decoration-white/40 underline-offset-4">
                          {doc.name}
                        </h3>
                        {doc.description && (
                          <p className="text-white/70 text-[10px] leading-tight mt-1 line-clamp-1 italic font-medium">
                            {doc.description}
                          </p>
                        )}
                      </div>

                      {/* Floating Actions */}
                      <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                         <div className="p-1 rounded bg-black/10 text-white">
                           <ExternalLink size={14} />
                         </div>
                      </div>
                      
                      <div className="absolute bottom-2 right-3 flex items-center gap-1.5 pointer-events-none">
                         <div className="flex items-center text-[8px] text-white/50 uppercase tracking-[0.15em] font-black">
                           <Clock size={10} className="mr-1" />
                           {doc.createdAt?.toDate().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                         </div>
                         <Download size={14} className="text-white/80 group-hover:scale-125 transition-transform" />
                      </div>
                    </motion.a>
                  );
                })}
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
