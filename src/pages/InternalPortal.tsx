import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Save, Link as LinkIcon, FileText, 
  Type, AlignLeft, LayoutPanelLeft, ChevronRight, 
  AlertCircle, CheckCircle2, Trash2, ExternalLink,
  Clock, Tag, Search, Edit2, X, Upload, HardDrive,
  RefreshCw, LogOut, File as FileIcon
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
  
  // Drive Integration States
  const [driveStatus, setDriveStatus] = useState<{
    configured: boolean;
    manualConnected: boolean;
    serviceAccountEmail: string;
    folderId: string;
  } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    category: CATEGORIES[0],
    subType: '',
    name: '',
    description: '',
    link: ''
  });

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
    if (!isAdmin) return;

    const q = query(collection(db, 'portal_documents'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setDocuments(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as PortalDoc)));
    });

    checkDriveStatus();

    // Listen for OAuth success from popup
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'OAUTH_AUTH_SUCCESS') {
        checkDriveStatus();
        setMessage({ type: 'success', text: 'Google Drive connected successfully!' });
      }
    };
    window.addEventListener('message', handleMessage);

    return () => {
      unsubscribe();
      window.removeEventListener('message', handleMessage);
    };
  }, [isAdmin]);

  const checkDriveStatus = async () => {
    try {
      console.log('Checking Google Drive status...');
      const res = await fetch('/api/auth/google/status', {
        credentials: 'include'
      });
      const data = await res.json();
      console.log('Drive status received:', data);
      setDriveStatus(data);
    } catch (err) {
      console.error('Failed to check Drive status:', err);
    }
  };

  const handleConnectDrive = async () => {
    try {
      console.log('Requesting Google Auth URL...');
      const res = await fetch('/api/auth/google/url', {
        credentials: 'include'
      });
      const data = await res.json();
      
      if (data.error) {
        setMessage({ type: 'error', text: `Auth Error: ${data.error}` });
        return;
      }

      const { url } = data;
      console.log('Opening auth window:', url);
      // Open in a popup for better experience
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      const authWindow = window.open(url, 'GoogleAuth', `width=${width},height=${height},left=${left},top=${top}`);
      
      if (!authWindow) {
        setMessage({ type: 'error', text: 'Popup blocked. Please allow popups for this site.' });
      }
    } catch (err) {
      console.error('Failed to get auth URL:', err);
      setMessage({ type: 'error', text: 'Could not initiate Google Auth. Check if backend is running.' });
    }
  };

  const handleDriveLogout = async () => {
    try {
      await fetch('/api/auth/google/logout', { 
        method: 'POST',
        credentials: 'include'
      });
      checkDriveStatus();
      setMessage({ type: 'success', text: 'Disconnected from Google Drive.' });
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

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
    
    if (!formData.subType || !formData.name) {
      setMessage({ type: 'error', text: 'Please provide a document name and sub-type.' });
      return;
    }

    if (!formData.link && !selectedFile) {
      setMessage({ type: 'error', text: 'Please provide either a link or select a file to upload.' });
      return;
    }

    setLoading(true);
    setMessage(null);
    setUploadProgress(0);

    try {
      let finalLink = formData.link;

      // Handle File Upload if present
      if (selectedFile) {
        // Validation check before attempting upload
        if (!driveStatus?.configured && !driveStatus?.manualConnected) {
          throw new Error('Please connect your Google Drive first using the button at the top.');
        }

        const uploadForm = new FormData();
        uploadForm.append('file', selectedFile);

        const endpoint = driveStatus?.configured ? '/api/drive/upload-service' : '/api/drive/upload-manual';
        
        const response = await fetch(endpoint, {
          method: 'POST',
          body: uploadForm,
          credentials: 'include'
        });

        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || 'Drive upload failed');
        }

        finalLink = result.link;
      }

      await addDoc(collection(db, 'portal_documents'), {
        ...formData,
        link: finalLink,
        createdBy: user?.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      setMessage({ type: 'success', text: 'Document record created successfully!' });
      setFormData({
        ...formData,
        name: '',
        description: '',
        link: ''
      });
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error: any) {
      console.error("Upload Error:", error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to process document. Please try again.' 
      });
    } finally {
      setLoading(false);
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-5xl font-black text-white uppercase tracking-tighter">Internal Portal</h1>
              <p className="font-mono text-sm uppercase tracking-widest text-yellow-400 font-bold mt-2">
                Department of Posts // DakShiksha Administrator
              </p>
            </div>

            {/* Drive Connection Status */}
            <div className="bg-black/20 p-4 border-2 border-black/30 backdrop-blur-sm rounded-sm min-w-[280px]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-widest font-bold opacity-70 flex items-center gap-2">
                  <HardDrive size={12} /> Google Drive Status
                </span>
                <button onClick={checkDriveStatus} className="hover:text-yellow-400 transition-colors">
                  <RefreshCw size={12} />
                </button>
              </div>
              
              <div className="flex items-center gap-3">
                {driveStatus?.configured || driveStatus?.manualConnected ? (
                  <>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                        <CheckCircle2 size={14} /> CONNECTED
                      </div>
                      <p className="text-[9px] opacity-60 truncate mt-1 italic">
                        {driveStatus.configured ? `Service: ${driveStatus.serviceAccountEmail}` : 'Connected via OAuth'}
                      </p>
                    </div>
                    {!driveStatus.configured && (
                      <button 
                        onClick={handleDriveLogout}
                        className="p-2 border border-white/20 hover:bg-white/10 rounded transition-colors text-white"
                        title="Disconnect"
                      >
                       <LogOut size={14} />
                      </button>
                    )}
                  </>
                ) : (
                  <div className="w-full">
                    <div className="flex items-center gap-2 text-xs font-bold text-yellow-400 mb-2">
                      <AlertCircle size={14} /> DISCONNECTED
                    </div>
                    <button 
                      onClick={handleConnectDrive}
                      className="w-full bg-yellow-400 text-black py-2 px-4 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-colors"
                    >
                      Connect Personal Drive
                    </button>
                  </div>
                )}
              </div>
            </div>
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
                      <LinkIcon size={10} /> Option 1: External URL Link
                    </label>
                    <input
                      type="url"
                      placeholder="https://example.com/document"
                      value={formData.link}
                      onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                      disabled={!!selectedFile}
                      className="w-full bg-[#E4E3E0]/50 border border-[#141414] p-3 font-mono text-xs focus:outline-none focus:bg-white transition-colors disabled:opacity-50"
                    />
                  </div>

                  <div className="relative">
                    <div className="flex items-center gap-2 mb-2">
                       <div className="h-px bg-black/10 flex-1" />
                       <span className="text-[9px] font-black uppercase tracking-widest text-[#141414]/30">OR</span>
                       <div className="h-px bg-black/10 flex-1" />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono italic uppercase opacity-50 tracking-wider flex items-center gap-1">
                        <Upload size={10} /> Option 2: Upload PDF to Google Drive
                      </label>
                      <input
                        type="file"
                        accept="application/pdf"
                        ref={fileInputRef}
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        disabled={!!formData.link}
                        className="hidden"
                        id="file-upload"
                      />
                      <label 
                        htmlFor="file-upload"
                        className={cn(
                          "w-full border-2 border-dashed border-black/20 p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 transition-all",
                          selectedFile ? "bg-emerald-50 border-emerald-300" : "",
                          formData.link ? "opacity-50 cursor-not-allowed" : ""
                        )}
                      >
                        {selectedFile ? (
                          <>
                            <FileIcon size={24} className="text-emerald-600" />
                            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-tighter truncate max-w-full px-2">
                              {selectedFile.name}
                            </span>
                            <span className="text-[8px] text-emerald-600">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                          </>
                        ) : (
                          <>
                            <Upload size={24} className="text-slate-400" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Click to browse PDF</span>
                          </>
                        )}
                      </label>
                      {selectedFile && (
                        <button 
                          type="button"
                          onClick={() => setSelectedFile(null)}
                          className="w-full py-1 text-[8px] uppercase tracking-widest font-black text-red-600 hover:underline"
                        >
                          Remove File
                        </button>
                      )}
                    </div>
                  </div>
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
                    Save Record
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
