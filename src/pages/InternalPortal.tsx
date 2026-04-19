import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Save, Link as LinkIcon, FileText, 
  Type, AlignLeft, LayoutPanelLeft, ChevronRight, 
  AlertCircle, CheckCircle2, Trash2, ExternalLink,
  Clock, Tag
} from 'lucide-react';

const CATEGORIES = [
  "GDS to MTS",
  "Postman Exam",
  "PA/SA Exam",
  "LGO Exam",
  "IP Exam",
  "PO Guide",
  "Postal Manuals",
  "Accountant Exam"
];

interface PortalDoc {
  id: string;
  category: string;
  subType: string;
  name: string;
  description: string;
  link: string;
  createdAt: any;
}

export function InternalPortal() {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [documents, setDocuments] = useState<PortalDoc[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    category: CATEGORIES[0],
    subType: '',
    name: '',
    description: '',
    link: ''
  });

  useEffect(() => {
    if (!isAdmin) return;

    const q = query(collection(db, 'portal_documents'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setDocuments(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as PortalDoc)));
    });

    return () => unsubscribe();
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-slate-900">Access Denied</h1>
        <p className="text-slate-600 mt-2">Only administrators can access the internal portal.</p>
      </div>
    );
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    
    setDeletingId(id);
    try {
      await deleteDoc(doc(db, 'portal_documents', id));
    } catch (error) {
      console.error("Delete Error:", error);
      alert('Failed to delete document.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subType || !formData.name || !formData.link) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await addDoc(collection(db, 'portal_documents'), {
        ...formData,
        createdBy: user?.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      setMessage({ type: 'success', text: 'Document uploaded successfully!' });
      setFormData({
        ...formData,
        name: '',
        description: '',
        link: ''
      });
    } catch (error: any) {
      console.error("Upload Error:", error);
      setMessage({ type: 'error', text: 'Failed to upload document. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E4E3E0] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Management Panel */}
        <div className="lg:col-span-12 mb-4">
          <div className="flex items-center gap-2 text-xs font-mono opacity-50 uppercase tracking-widest mb-2">
            <span>Admin Control Panel</span>
            <ChevronRight size={12} />
            <span>Document Management</span>
          </div>
          <h1 className="text-5xl font-serif italic text-[#141414]">Internal Portal</h1>
          <p className="text-[#141414]/60 mt-2 font-mono text-sm uppercase tracking-tight">
            Centralized document control & repository
          </p>
        </div>

        {/* Upload Form */}
        <div className="lg:col-span-5">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white border border-[#141414] shadow-[8px_8px_0px_#141414] sticky top-8"
          >
            <div className="p-6 border-b border-[#141414] bg-[#141414] text-white">
              <h2 className="text-lg font-serif italic flex items-center gap-2">
                <Plus size={18} /> Add New Document
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-4">
                {/* Category */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono italic uppercase opacity-50 tracking-wider flex items-center gap-1">
                    <LayoutPanelLeft size={10} /> Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-[#E4E3E0] border border-[#141414] p-3 font-mono text-xs focus:outline-none focus:bg-white transition-colors"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Sub-Type */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono italic uppercase opacity-50 tracking-wider flex items-center gap-1">
                    <Type size={10} /> Sub-Type *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Previous Year Papers"
                    value={formData.subType}
                    onChange={(e) => setFormData({ ...formData, subType: e.target.value })}
                    className="w-full bg-[#E4E3E0] border border-[#141414] p-3 font-mono text-xs focus:outline-none focus:bg-white transition-colors"
                    required
                  />
                </div>

                {/* Document Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono italic uppercase opacity-50 tracking-wider flex items-center gap-1">
                    <FileText size={10} /> Document Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Official Title"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#E4E3E0] border border-[#141414] p-3 font-mono text-xs focus:outline-none focus:bg-white transition-colors"
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono italic uppercase opacity-50 tracking-wider flex items-center gap-1">
                    <AlignLeft size={10} /> Description
                  </label>
                  <textarea
                    placeholder="Brief context..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-[#E4E3E0] border border-[#141414] p-3 font-mono text-xs min-h-[80px] focus:outline-none focus:bg-white transition-colors resize-none"
                  />
                </div>

                {/* Link */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono italic uppercase opacity-50 tracking-wider flex items-center gap-1">
                    <LinkIcon size={10} /> Google Drive Link *
                  </label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/..."
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    className="w-full bg-[#E4E3E0] border border-[#141414] p-3 font-mono text-xs focus:outline-none focus:bg-white transition-colors"
                    required
                  />
                </div>
              </div>

              {message && (
                <div className={`p-3 font-mono text-[10px] flex items-center gap-2 ${
                  message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {message.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#141414] text-[#E4E3E0] py-3 px-6 font-mono text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#E4E3E0] hover:text-[#141414] border border-[#141414] transition-all disabled:opacity-50 group"
              >
                {loading ? 'Processing...' : (
                  <>
                    <Save size={16} className="group-hover:scale-110 transition-transform" />
                    Save & Upload
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>

        {/* Document List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-xl font-serif italic flex items-center gap-2">
              <FileText size={20} /> Repository
            </h2>
            <span className="text-[10px] font-mono uppercase bg-white border border-[#141414] px-2 py-1">
              {documents.length} Records
            </span>
          </div>

          <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
            <AnimatePresence>
              {documents.map((doc) => (
                <motion.div
                  key={doc.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white border border-[#141414] p-4 flex gap-4 group hover:bg-[#E4E3E0]/30 transition-colors"
                >
                  <div className="w-10 h-10 bg-[#141414] text-white flex items-center justify-center shrink-0">
                    <FileText size={18} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-sm text-[#141414] truncate uppercase tracking-tight">
                        {doc.name}
                      </h3>
                      <div className="flex items-center gap-2 shrink-0">
                        <a 
                          href={doc.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-1.5 hover:bg-[#141414] hover:text-white transition-colors border border-transparent hover:border-[#141414]"
                        >
                          <ExternalLink size={14} />
                        </a>
                        <button 
                          onClick={() => handleDelete(doc.id)}
                          disabled={deletingId === doc.id}
                          className="p-1.5 text-red-600 hover:bg-red-600 hover:text-white transition-colors border border-transparent hover:border-red-600 disabled:opacity-30"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-2 flex flex-wrap gap-3 items-center text-[10px] font-mono text-[#141414]/50">
                      <span className="flex items-center gap-1 border-r border-[#141414]/10 pr-3 uppercase">
                        <LayoutPanelLeft size={10} /> {doc.category}
                      </span>
                      <span className="flex items-center gap-1 border-r border-[#141414]/10 pr-3 uppercase">
                        <Tag size={10} /> {doc.subType}
                      </span>
                      <span className="flex items-center gap-1 uppercase">
                        <Clock size={10} /> {doc.createdAt?.toDate().toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {documents.length === 0 && (
              <div className="p-12 border-2 border-dashed border-[#141414]/20 text-center">
                <p className="text-xs font-mono text-[#141414]/40 uppercase tracking-widest">
                  No records found in database
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
