import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, storage } from '../firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Save, Link as LinkIcon, FileText, 
  Type, AlignLeft, LayoutPanelLeft, ChevronRight, 
  AlertCircle, CheckCircle2, Trash2, ExternalLink,
  Clock, Tag, Search, Edit2, X
} from 'lucide-react';
import { cn } from '../lib/utils';

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
  const { user, isAdmin, login, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [documents, setDocuments] = useState<PortalDoc[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingDoc, setEditingDoc] = useState<PortalDoc | null>(null);
  
  const [formData, setFormData] = useState({
    category: CATEGORIES[0],
    subType: '',
    name: '',
    description: '',
    link: ''
  });

  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isDriveConnected, setIsDriveConnected] = useState(false);

  const [editFormData, setEditFormData] = useState({
    subType: '',
    name: '',
    description: '',
    link: ''
  });

  useEffect(() => {
    if (editingDoc) {
      setEditFormData({
        subType: editingDoc.subType,
        name: editingDoc.name,
        description: editingDoc.description || '',
        link: editingDoc.link
      });
    }
  }, [editingDoc]);

  useEffect(() => {
    const checkDriveStatus = async () => {
      try {
        const res = await fetch('/api/auth/google/status', { credentials: 'include' });
        const data = await res.json();
        setIsDriveConnected(data.connected);
      } catch (error) {
        console.error("Status Check Error:", error);
      }
    };
    checkDriveStatus();

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        setIsDriveConnected(true);
        setMessage({ type: 'success', text: 'Linked to Google Drive!' });
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const connectGoogleDrive = async () => {
    try {
      const res = await fetch('/api/auth/google/url', { credentials: 'include' });
      const { url } = await res.json();
      window.open(url, 'google_oauth', 'width=600,height=700');
    } catch (error) {
      console.error("Connect Error:", error);
      alert('Failed to get connection URL.');
    }
  };

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
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center bg-slate-50">
        <div className="bg-white p-12 border-4 border-black shadow-[8px_8px_0px_#000] max-w-md">
          <AlertCircle size={48} className="text-postal-red mx-auto mb-4" />
          <h1 className="text-2xl font-black uppercase tracking-widest text-slate-900">Access Denied</h1>
          <p className="text-slate-600 mt-4 font-medium">Only authorized administrators can access the internal portal features.</p>
          
          {!user ? (
            <div className="mt-8 space-y-4">
              <p className="text-xs text-slate-400 uppercase tracking-widest">Please sign in to continue</p>
              <button 
                onClick={login}
                className="w-full bg-postal-red text-white py-4 font-black uppercase tracking-widest border-4 border-black shadow-[4px_4px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-2"
              >
                Sign In with Google
              </button>
            </div>
          ) : (
            <div className="mt-8">
              <p className="text-xs text-slate-400 uppercase tracking-widest mb-4">Logged in as: {user.email}</p>
              <button 
                onClick={logout}
                className="w-full bg-white text-black py-4 font-black uppercase tracking-widest border-4 border-black shadow-[4px_4px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
              >
                Switch Account / Logout
              </button>
            </div>
          )}
          
          <button 
            onClick={() => navigate('/')}
            className="mt-6 text-xs font-bold text-slate-400 hover:text-postal-red transition-colors uppercase tracking-widest"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setMessage(null);
    try {
      await deleteDoc(doc(db, 'portal_documents', id));
      setConfirmDeleteId(null);
      setMessage({ type: 'success', text: 'Document removed from repository.' });
    } catch (error) {
      console.error("Delete Error:", error);
      setMessage({ type: 'error', text: 'Insufficient permissions or database error. Please verify you are logged in as administrator.' });
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoc) return;
    
    setLoading(true);
    try {
      const docRef = doc(db, 'portal_documents', editingDoc.id);
      await updateDoc(docRef, {
        ...editFormData,
        updatedAt: serverTimestamp()
      });
      setMessage({ type: 'success', text: 'Document updated successfully.' });
      setEditingDoc(null);
    } catch (error) {
      console.error("Update Error:", error);
      setMessage({ type: 'error', text: 'Failed to update document.' });
    } finally {
      setLoading(false);
    }
  };

  const filteredDocuments = documents.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.subType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subType || !formData.name || (!formData.link && !file)) {
      setMessage({ type: 'error', text: 'Please fill in all required fields or upload a file.' });
      return;
    }

    // Double check connection status
    if (file) {
      const statusRes = await fetch('/api/auth/google/status', { credentials: 'include' });
      const statusData = await statusRes.json();
      if (!statusData.connected) {
        setIsDriveConnected(false);
        setMessage({ type: 'error', text: 'Google Drive session expired. Please click "Link Google Drive" again.' });
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    setIsUploading(true);
    setMessage(null);

    try {
      let finalLink = formData.link;

      if (file) {
        if (isDriveConnected) {
          // Upload to Google Drive
          const uploadFormData = new FormData();
          uploadFormData.append('file', file);
          
          const res = await fetch('/api/drive/upload', {
            method: 'POST',
            body: uploadFormData,
            credentials: 'include'
          });
          
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Drive upload failed');
          }
          const data = await res.json();
          finalLink = data.link;
        } else {
          // Fallback to Firebase Storage
          const fileRef = ref(storage, `portal/${Date.now()}_${file.name}`);
          const uploadTask = uploadBytesResumable(fileRef, file);

          finalLink = await new Promise((resolve, reject) => {
            uploadTask.on('state_changed', 
              (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(progress);
              }, 
              (error) => reject(error), 
              async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(downloadURL);
              }
            );
          });
        }
      }

      await addDoc(collection(db, 'portal_documents'), {
        ...formData,
        link: finalLink,
        createdBy: user?.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      setMessage({ type: 'success', text: 'Document uploaded successfully!' });
      setFile(null);
      setUploadProgress(0);
      setFormData({
        ...formData,
        name: '',
        description: '',
        link: ''
      });
    } catch (error: any) {
      console.error("Upload Error:", error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to upload document. Please try again.' 
      });
    } finally {
      setLoading(false);
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-yellow-400 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Management Panel */}
        <div className="lg:col-span-12 mb-4 bg-postal-red p-8 text-white border-4 border-black shadow-[12px_12px_0px_#000]">
          <div className="flex items-center gap-2 text-xs font-mono opacity-80 uppercase tracking-widest mb-2 font-bold">
            <span className="bg-yellow-400 text-black px-1">Admin Control Panel</span>
            <ChevronRight size={12} className="text-yellow-400" />
            <span className="bg-yellow-400 text-black px-1">Repository Control</span>
          </div>
          <h1 className="text-5xl font-black text-white uppercase tracking-tighter">Internal Portal</h1>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
            <p className="font-mono text-sm uppercase tracking-widest text-yellow-400 font-bold">
              Department of Posts // DakShiksha Administrator
            </p>
            <button
              onClick={connectGoogleDrive}
              className={cn(
                "px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_#000] transition-all flex items-center gap-2",
                isDriveConnected ? "bg-emerald-500 text-white" : "bg-white text-black hover:bg-yellow-400"
              )}
            >
              <LinkIcon size={14} />
              {isDriveConnected ? 'Drive Linked' : 'Link Google Drive'}
            </button>
          </div>
        </div>

        {/* Upload Form */}
        <div className="lg:col-span-5">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white border-4 border-black shadow-[8px_8px_0px_#000] sticky top-8"
          >
            <div className="p-6 border-b-4 border-black bg-postal-red text-white flex items-center justify-between">
              <h2 className="text-lg font-bold uppercase tracking-tight flex items-center gap-2">
                <Plus size={18} /> New Entry
              </h2>
              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
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

                {/* Link or File */}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono italic uppercase opacity-50 tracking-wider flex items-center gap-1">
                      <LinkIcon size={10} /> Option 1: External / Drive Link
                    </label>
                    <input
                      type="url"
                      placeholder="https://drive.google.com/..."
                      value={formData.link}
                      onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                      className="w-full bg-[#E4E3E0] border border-[#141414] p-3 font-mono text-xs focus:outline-none focus:bg-white transition-colors"
                      disabled={!!file}
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[#141414]/20 border-dashed"></div>
                    </div>
                    <div className="relative flex justify-center text-[8px] font-mono uppercase tracking-widest text-[#141414]/40">
                      <span className="bg-white px-2 italic">OR UPLOAD DIRECTLY</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono italic uppercase opacity-50 tracking-wider flex items-center gap-1">
                      <FileText size={10} /> Option 2: Upload File (PDF, DOC, Excel, CSV)
                    </label>
                    <div className="relative group">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.csv"
                        onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                        className="w-full bg-slate-50 border-2 border-dashed border-black p-6 font-mono text-[10px] focus:outline-none cursor-pointer hover:bg-yellow-50 transition-colors"
                        disabled={formData.link !== ''}
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        {file ? (
                          <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-2 py-1 border border-emerald-200">
                             <CheckCircle2 size={12} />
                             <span className="text-[8px] font-bold">{file.name}</span>
                          </div>
                        ) : (
                          <Plus size={16} className="text-black/20" />
                        )}
                      </div>
                    </div>
                  </div>

                  {isUploading && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[8px] font-mono font-bold uppercase">
                        <span>Uploading to Cloud...</span>
                        <span>{Math.round(uploadProgress)}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 border border-black overflow-hidden">
                        <motion.div 
                          className="h-full bg-postal-red" 
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
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
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4 bg-white p-4 border-4 border-black shadow-[4px_4px_0px_#000]">
            <h2 className="text-xl font-bold uppercase tracking-tight flex items-center gap-2">
              <FileText size={20} className="text-postal-red" /> Active Records
            </h2>
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text"
                placeholder="Search repository..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border-2 border-black font-mono text-xs focus:ring-0 focus:bg-white transition-colors"
              />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase bg-postal-red text-white border-2 border-black px-2 py-1">
              {filteredDocuments.length} Found
            </span>
          </div>

          <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
            <AnimatePresence>
              {filteredDocuments.map((doc) => (
                <motion.div
                  key={doc.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white border-4 border-black p-4 flex gap-4 group hover:bg-slate-50 transition-colors shadow-[4px_4px_0px_#000]"
                >
                  <div className="w-10 h-10 bg-postal-red text-white border-2 border-black flex items-center justify-center shrink-0">
                    <FileText size={18} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-sm text-black truncate uppercase tracking-tight">
                        {doc.name}
                      </h3>
                      <div className="flex items-center gap-1 shrink-0">
                        <a 
                          href={doc.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 border-2 border-black hover:bg-yellow-400 transition-colors"
                          title="Open Link"
                        >
                          <ExternalLink size={14} />
                        </a>
                        <button 
                          onClick={() => setEditingDoc(doc)}
                          className="p-2 border-2 border-black hover:bg-postal-red hover:text-white transition-colors"
                          title="Edit Document"
                        >
                          <Edit2 size={14} />
                        </button>
                        {confirmDeleteId === doc.id ? (
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={() => handleDelete(doc.id)}
                              disabled={deletingId === doc.id}
                              className="px-2 py-2 bg-red-600 text-white text-[10px] border-2 border-black font-bold uppercase hover:bg-red-700"
                            >
                              {deletingId === doc.id ? '...' : 'YES'}
                            </button>
                            <button 
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2 py-2 bg-slate-100 text-black text-[10px] border-2 border-black font-bold uppercase"
                            >
                              NO
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setConfirmDeleteId(doc.id)}
                            className="p-2 border-2 border-black text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
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

      {/* Edit Modal */}
      <AnimatePresence>
        {editingDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border-8 border-black shadow-[16px_16px_0px_#000] w-full max-w-2xl overflow-hidden"
            >
              <div className="bg-postal-red p-6 border-b-4 border-black text-white flex items-center justify-between">
                <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-2">
                  <Edit2 size={24} /> Edit Record
                </h2>
                <button 
                  onClick={() => setEditingDoc(null)}
                  className="p-2 hover:bg-yellow-400 hover:text-black transition-colors border-2 border-black"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Sub-Type</label>
                    <input 
                      type="text"
                      value={editFormData.subType}
                      onChange={(e) => setEditFormData({ ...editFormData, subType: e.target.value })}
                      className="w-full p-3 bg-slate-100 border-2 border-black font-mono text-sm focus:bg-white"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Document Name</label>
                    <input 
                      type="text"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      className="w-full p-3 bg-slate-100 border-2 border-black font-mono text-sm focus:bg-white"
                      required
                    />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Description</label>
                    <textarea 
                      value={editFormData.description}
                      onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                      className="w-full p-3 bg-slate-100 border-2 border-black font-mono text-sm h-32 resize-none focus:bg-white"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Link</label>
                    <input 
                      type="url"
                      value={editFormData.link}
                      onChange={(e) => setEditFormData({ ...editFormData, link: e.target.value })}
                      className="w-full p-3 bg-slate-100 border-2 border-black font-mono text-sm focus:bg-white"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-8">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-postal-red text-white py-4 font-black uppercase tracking-widest border-4 border-black shadow-[4px_4px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50"
                  >
                    {loading ? 'Updating...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingDoc(null)}
                    className="flex-1 bg-white text-black py-4 font-black uppercase tracking-widest border-4 border-black shadow-[4px_4px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
