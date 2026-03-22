import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType, storage } from '../firebase';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Plus, Trash2, Edit, Save, X, Upload, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export function AdminDashboard() {
  const { isAdmin, loading } = useAuth();
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  
  const [newClass, setNewClass] = useState({ name: '', order: 0 });
  const [newSubject, setNewSubject] = useState({ name: '', icon: 'Book', classId: '' });
  const [newChapter, setNewChapter] = useState({ title: '', videoUrl: '', subjectId: '', classId: '', quizHtml: '' });
  const [chapterDocs, setChapterDocs] = useState<{title: string, url: string, type: 'pdf' | 'doc' | 'ppt'}[]>([]);
  const [newDoc, setNewDoc] = useState({ title: '', url: '', type: 'pdf' as 'pdf' | 'doc' | 'ppt' });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ coll: string, id: string } | null>(null);
  const [quickUpload, setQuickUpload] = useState({
    classId: '',
    subjectId: '',
    chapterId: '',
    type: 'document' as 'document' | 'video' | 'quiz'
  });

  useEffect(() => {
    if (!isAdmin) return;

    const unsubClasses = onSnapshot(query(collection(db, 'classes'), orderBy('order')), (snap) => {
      setClasses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'classes'));
    
    const unsubSubjects = onSnapshot(collection(db, 'subjects'), (snap) => {
      setSubjects(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'subjects'));
    
    const unsubChapters = onSnapshot(collection(db, 'chapters'), (snap) => {
      setChapters(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'chapters'));

    return () => {
      unsubClasses();
      unsubSubjects();
      unsubChapters();
    };
  }, [isAdmin]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!isAdmin) return <div className="p-8 text-center text-red-500">Access Denied. Admin only.</div>;

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check for duplicate class name
    const isDuplicate = classes.some(c => c.name.toLowerCase() === newClass.name.toLowerCase());
    if (isDuplicate) {
      alert(`Error: A class with the name "${newClass.name}" already exists.`);
      return;
    }

    try {
      await addDoc(collection(db, 'classes'), { ...newClass, id: Date.now().toString() });
      setNewClass({ name: '', order: classes.length + 1 });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'classes');
    }
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'subjects'), { ...newSubject, id: Date.now().toString() });
      setNewSubject({ name: '', icon: 'Book', classId: '' });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'subjects');
    }
  };

  const handleAddChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'chapters'), { 
        ...newChapter, 
        documents: chapterDocs,
        id: Date.now().toString() 
      });
      setNewChapter({ title: '', videoUrl: '', subjectId: '', classId: '', quizHtml: '' });
      setChapterDocs([]);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'chapters');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `chapters/${fileName}`;
      const storageRef = ref(storage, filePath);

      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        }, 
        (error) => {
          console.error('Error uploading file:', error.message);
          alert('Upload failed. Please check your Firebase Storage rules.');
          setUploading(false);
        }, 
        async () => {
          const publicUrl = await getDownloadURL(uploadTask.snapshot.ref);
          setNewDoc({
            ...newDoc,
            title: file.name,
            url: publicUrl,
            type: fileExt === 'pdf' ? 'pdf' : (fileExt === 'ppt' || fileExt === 'pptx' ? 'ppt' : 'doc')
          });
          setUploading(false);
        }
      );
    } catch (error: any) {
      console.error('Error uploading file:', error.message);
      alert('Upload failed. Please ensure Firebase Storage is configured.');
      setUploading(false);
    }
  };

  const addDocToChapter = () => {
    if (!newDoc.title || !newDoc.url) return;
    setChapterDocs([...chapterDocs, newDoc]);
    setNewDoc({ title: '', url: '', type: 'pdf' });
  };

  const removeDocFromChapter = (index: number) => {
    setChapterDocs(chapterDocs.filter((_, i) => i !== index));
  };

  const handleEditChapter = (chapter: any) => {
    setEditingChapterId(chapter.id);
    setEditData({ ...chapter });
    setChapterDocs(chapter.documents || []);
  };

  const handleUpdateChapterField = async (field: string, value: any) => {
    if (!editingChapterId) return;
    try {
      await updateDoc(doc(db, 'chapters', editingChapterId), { [field]: value });
      setEditData({ ...editData, [field]: value });
      alert(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully!`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `chapters/${editingChapterId}`);
    }
  };

  const handleAddDocToExisting = async () => {
    if (!newDoc.title || !newDoc.url || !editingChapterId) return;
    const updatedDocs = [...(editData.documents || []), newDoc];
    try {
      await updateDoc(doc(db, 'chapters', editingChapterId), { documents: updatedDocs });
      setEditData({ ...editData, documents: updatedDocs });
      setNewDoc({ title: '', url: '', type: 'pdf' });
      alert('Document added successfully!');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `chapters/${editingChapterId}`);
    }
  };

  const handleRemoveDocFromExisting = async (index: number) => {
    if (!editingChapterId) return;
    const updatedDocs = editData.documents.filter((_: any, i: number) => i !== index);
    try {
      await updateDoc(doc(db, 'chapters', editingChapterId), { documents: updatedDocs });
      setEditData({ ...editData, documents: updatedDocs });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `chapters/${editingChapterId}`);
    }
  };

  const handleQuickUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickUpload.chapterId) return;

    try {
      const chapterRef = doc(db, 'chapters', quickUpload.chapterId);
      const chapter = chapters.find(ch => ch.id === quickUpload.chapterId);
      
      if (quickUpload.type === 'document') {
        if (!newDoc.title || !newDoc.url) {
          alert('Please upload a document first');
          return;
        }
        const updatedDocs = [...(chapter.documents || []), newDoc];
        await updateDoc(chapterRef, { documents: updatedDocs });
        setNewDoc({ title: '', url: '', type: 'pdf' });
      } else if (quickUpload.type === 'video') {
        if (!newChapter.videoUrl) {
          alert('Please enter a video URL');
          return;
        }
        await updateDoc(chapterRef, { videoUrl: newChapter.videoUrl });
        setNewChapter({ ...newChapter, videoUrl: '' });
      } else if (quickUpload.type === 'quiz') {
        if (!newChapter.quizHtml) {
          alert('Please enter quiz HTML');
          return;
        }
        await updateDoc(chapterRef, { quizHtml: newChapter.quizHtml });
        setNewChapter({ ...newChapter, quizHtml: '' });
      }
      
      alert('Content uploaded successfully to the chapter!');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `chapters/${quickUpload.chapterId}`);
    }
  };

  const handleDelete = async (coll: string, id: string) => {
    try {
      await deleteDoc(doc(db, coll, id));
      setDeleteConfirm(null);
    } catch (error: any) {
      console.error("Delete Error:", error);
      alert(`Error deleting item: ${error.message || "Unknown error"}`);
      handleFirestoreError(error, OperationType.DELETE, `${coll}/${id}`);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-12 font-display text-4xl font-bold text-brand-500">Admin Dashboard</h1>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl"
          >
            <h3 className="mb-4 text-xl font-bold text-slate-900">Are you sure?</h3>
            <p className="mb-8 text-slate-600">This action cannot be undone. All related data might be affected.</p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 rounded-xl border border-slate-200 py-3 font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.coll, deleteConfirm.id)}
                className="flex-1 rounded-xl bg-red-500 py-3 font-bold text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Quick Upload Section */}
      <section className="mb-12 rounded-3xl border border-brand-200 bg-brand-50/30 p-8 shadow-sm">
        <h2 className="mb-6 text-2xl font-bold text-brand-700">Quick Upload Content</h2>
        <form onSubmit={handleQuickUploadSubmit} className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">Select Class</label>
            <select
              value={quickUpload.classId}
              onChange={e => setQuickUpload({ ...quickUpload, classId: e.target.value, subjectId: '', chapterId: '' })}
              className="w-full rounded-xl border border-slate-200 bg-white p-3 focus:border-brand-500 focus:outline-none"
              required
            >
              <option value="">Select Class</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">Select Subject</label>
            <select
              value={quickUpload.subjectId}
              onChange={e => setQuickUpload({ ...quickUpload, subjectId: e.target.value, chapterId: '' })}
              className="w-full rounded-xl border border-slate-200 bg-white p-3 focus:border-brand-500 focus:outline-none"
              required
              disabled={!quickUpload.classId}
            >
              <option value="">Select Subject</option>
              {subjects.filter(s => s.classId === quickUpload.classId).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">Select Chapter</label>
            <select
              value={quickUpload.chapterId}
              onChange={e => setQuickUpload({ ...quickUpload, chapterId: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white p-3 focus:border-brand-500 focus:outline-none"
              required
              disabled={!quickUpload.subjectId}
            >
              <option value="">Select Chapter</option>
              {chapters.filter(ch => ch.subjectId === quickUpload.subjectId).map(ch => <option key={ch.id} value={ch.id}>{ch.title}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">Upload Type</label>
            <select
              value={quickUpload.type}
              onChange={e => setQuickUpload({ ...quickUpload, type: e.target.value as any })}
              className="w-full rounded-xl border border-slate-200 bg-white p-3 focus:border-brand-500 focus:outline-none"
              required
            >
              <option value="document">Document (File)</option>
              <option value="video">Video (Link)</option>
              <option value="quiz">Quiz (HTML)</option>
            </select>
          </div>

          <div className="md:col-span-2 lg:col-span-4">
            {quickUpload.type === 'document' && (
              <div className="space-y-4 rounded-2xl border border-slate-100 bg-white p-4">
                <div className="rounded-xl border-2 border-dashed border-slate-200 p-6 text-center">
                  <input
                    type="file"
                    id="quick-file-upload"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx,.ppt,.pptx"
                    disabled={uploading}
                  />
                  <label htmlFor="quick-file-upload" className="cursor-pointer">
                    {uploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="animate-spin text-brand-500" size={32} />
                        <p className="text-sm font-medium text-slate-600">Uploading... {Math.round(uploadProgress)}%</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="text-slate-400" size={32} />
                        <p className="text-sm font-medium text-slate-600">Upload Document</p>
                      </div>
                    )}
                  </label>
                </div>
                {newDoc.url && (
                  <div className="flex items-center gap-4 rounded-xl bg-slate-50 p-3">
                    <div className="flex-grow">
                      <p className="text-sm font-bold">{newDoc.title}</p>
                      <p className="text-xs text-slate-500 truncate">{newDoc.url}</p>
                    </div>
                    <button type="button" onClick={() => setNewDoc({ title: '', url: '', type: 'pdf' })} className="text-red-500">
                      <X size={20} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {quickUpload.type === 'video' && (
              <input
                type="text"
                placeholder="Paste YouTube/Video URL here"
                value={newChapter.videoUrl}
                onChange={e => setNewChapter({ ...newChapter, videoUrl: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 focus:border-brand-500 focus:outline-none"
              />
            )}

            {quickUpload.type === 'quiz' && (
              <textarea
                placeholder="Paste Quiz HTML content here"
                value={newChapter.quizHtml}
                onChange={e => setNewChapter({ ...newChapter, quizHtml: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 focus:border-brand-500 focus:outline-none"
                rows={4}
              />
            )}
          </div>

          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded-xl bg-brand-500 p-4 font-bold text-white hover:bg-brand-600 md:col-span-2 lg:col-span-4"
          >
            <Upload size={24} /> Submit Upload
          </button>
        </form>
      </section>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Classes Management */}
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-2xl font-bold">Manage Classes</h2>
          <form onSubmit={handleAddClass} className="mb-8 flex flex-col gap-4">
            <div className="flex gap-4">
              <select
                value={newClass.name}
                onChange={e => setNewClass({ ...newClass, name: e.target.value })}
                className="flex-grow rounded-xl border border-slate-200 p-3 focus:border-brand-500 focus:outline-none"
                required
              >
                <option value="">Select Class Name</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i} value={`Class ${i + 1}`}>Class {i + 1}</option>
                ))}
                <option value="JEE">JEE</option>
                <option value="NEET">NEET</option>
                <option value="UPSC">UPSC</option>
                <option value="Competitive Exams">Competitive Exams</option>
                <option value="Other">Other</option>
              </select>
              <input
                type="number"
                placeholder="Order"
                value={newClass.order}
                onChange={e => setNewClass({ ...newClass, order: parseInt(e.target.value) })}
                className="w-24 rounded-xl border border-slate-200 p-3 focus:border-brand-500 focus:outline-none"
                required
              />
              <button type="submit" className="rounded-xl bg-brand-500 p-3 text-white hover:bg-brand-600">
                <Plus size={24} />
              </button>
            </div>
            {newClass.name === 'Other' && (
              <input
                type="text"
                placeholder="Enter Custom Class Name"
                onChange={e => setNewClass({ ...newClass, name: e.target.value })}
                className="rounded-xl border border-slate-200 p-3 focus:border-brand-500 focus:outline-none"
                required
              />
            )}
          </form>
          <div className="space-y-2">
            {classes.map(c => (
              <div key={c.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                <span className="font-bold">{c.name} (Order: {c.order})</span>
                <button onClick={() => setDeleteConfirm({ coll: 'classes', id: c.id })} className="text-red-500 hover:text-red-700">
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Subjects Management */}
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-2xl font-bold">Manage Subjects</h2>
          <form onSubmit={handleAddSubject} className="mb-8 space-y-4">
            <select
              value={newSubject.classId}
              onChange={e => setNewSubject({ ...newSubject, classId: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-3 focus:border-brand-500 focus:outline-none"
              required
            >
              <option value="">Select Class</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Subject Name"
                value={newSubject.name}
                onChange={e => setNewSubject({ ...newSubject, name: e.target.value })}
                className="flex-grow rounded-xl border border-slate-200 p-3 focus:border-brand-500 focus:outline-none"
                required
              />
              <button type="submit" className="rounded-xl bg-brand-500 p-3 text-white hover:bg-brand-600">
                <Plus size={24} />
              </button>
            </div>
          </form>
          <div className="space-y-2">
            {subjects.map(s => (
              <div key={s.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                <div>
                  <span className="font-bold">{s.name}</span>
                  <span className="ml-2 text-xs text-slate-500">({classes.find(c => c.id === s.classId)?.name})</span>
                </div>
                <button onClick={() => setDeleteConfirm({ coll: 'subjects', id: s.id })} className="text-red-500 hover:text-red-700">
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Chapters Management */}
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm lg:col-span-2">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold">{editingChapterId ? 'Edit Chapter' : 'Add New Chapter'}</h2>
            {editingChapterId && (
              <button 
                onClick={() => { setEditingChapterId(null); setEditData(null); setChapterDocs([]); }}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-700"
              >
                <X size={20} /> Cancel Edit
              </button>
            )}
          </div>

          {!editingChapterId ? (
            <form onSubmit={handleAddChapter} className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
              <select
                value={newChapter.classId}
                onChange={e => setNewChapter({ ...newChapter, classId: e.target.value, subjectId: '' })}
                className="rounded-xl border border-slate-200 p-3 focus:border-brand-500 focus:outline-none"
                required
              >
                <option value="">Select Class</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select
                value={newChapter.subjectId}
                onChange={e => setNewChapter({ ...newChapter, subjectId: e.target.value })}
                className="rounded-xl border border-slate-200 p-3 focus:border-brand-500 focus:outline-none"
                required
              >
                <option value="">Select Subject</option>
                {subjects.filter(s => s.classId === newChapter.classId).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <input
                type="text"
                placeholder="Chapter Title"
                value={newChapter.title}
                onChange={e => setNewChapter({ ...newChapter, title: e.target.value })}
                className="rounded-xl border border-slate-200 p-3 focus:border-brand-500 focus:outline-none md:col-span-2"
                required
              />
              
              <div className="md:col-span-2 space-y-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <h3 className="font-bold text-slate-700">Section 1: Documents (PDF, DOC, PPT)</h3>
                
                <div className="mb-4 rounded-xl border-2 border-dashed border-slate-200 bg-white p-6 text-center transition-colors hover:border-brand-500">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx,.ppt,.pptx"
                    disabled={uploading}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    {uploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="animate-spin text-brand-500" size={32} />
                        <p className="text-sm font-medium text-slate-600">Uploading to Firebase... {Math.round(uploadProgress)}%</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="text-slate-400" size={32} />
                        <p className="text-sm font-medium text-slate-600">Click to upload from your device</p>
                        <p className="text-xs text-slate-400">PDF, DOC, PPT supported</p>
                      </div>
                    )}
                  </label>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
                  <input
                    type="text"
                    placeholder="Doc Title"
                    value={newDoc.title}
                    onChange={e => setNewDoc({ ...newDoc, title: e.target.value })}
                    className="rounded-lg border border-slate-200 p-2 text-sm focus:outline-none sm:col-span-1"
                  />
                  <input
                    type="text"
                    placeholder="Doc URL (Auto-filled on upload)"
                    value={newDoc.url}
                    onChange={e => setNewDoc({ ...newDoc, url: e.target.value })}
                    className="rounded-lg border border-slate-200 p-2 text-sm focus:outline-none sm:col-span-1"
                  />
                  <select
                    value={newDoc.type}
                    onChange={e => setNewDoc({ ...newDoc, type: e.target.value as any })}
                    className="rounded-lg border border-slate-200 p-2 text-sm focus:outline-none sm:col-span-1"
                  >
                    <option value="pdf">PDF</option>
                    <option value="doc">DOC</option>
                    <option value="ppt">PPT</option>
                  </select>
                  <button
                    type="button"
                    onClick={addDocToChapter}
                    className="rounded-lg bg-slate-900 p-2 text-white hover:bg-slate-800 sm:col-span-1"
                  >
                    Add to List
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {chapterDocs.map((doc, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium shadow-sm">
                      <span className="uppercase text-brand-500">{doc.type}</span>: {doc.title}
                      <button type="button" onClick={() => removeDocFromChapter(i)} className="text-red-500 hover:text-red-700">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2 space-y-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <h3 className="font-bold text-slate-700">Section 2: Video (Link)</h3>
                <input
                  type="text"
                  placeholder="YouTube/Video Embed URL"
                  value={newChapter.videoUrl}
                  onChange={e => setNewChapter({ ...newChapter, videoUrl: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-3 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2 space-y-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <h3 className="font-bold text-slate-700">Section 3: Quiz (HTML Content)</h3>
                <textarea
                  placeholder="Paste Quiz HTML here (e.g. Google Forms embed code or custom HTML)"
                  value={newChapter.quizHtml}
                  onChange={e => setNewChapter({ ...newChapter, quizHtml: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-3 focus:border-brand-500 focus:outline-none"
                  rows={4}
                />
              </div>

              <button type="submit" className="flex items-center justify-center gap-2 rounded-xl bg-brand-500 p-4 font-bold text-white hover:bg-brand-600 md:col-span-2">
                <Plus size={24} /> Add Chapter
              </button>
            </form>
          ) : (
            <div className="mb-8 space-y-8">
              <div className="rounded-2xl bg-slate-50 p-6">
                <h3 className="mb-4 text-lg font-bold">Editing: {editData.title}</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-500">Chapter Title</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editData.title}
                        onChange={e => setEditData({ ...editData, title: e.target.value })}
                        className="flex-grow rounded-xl border border-slate-200 p-2 focus:outline-none"
                      />
                      <button 
                        onClick={() => handleUpdateChapterField('title', editData.title)}
                        className="rounded-xl bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800"
                      >
                        Update
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Independent Document Upload */}
              <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50 p-6">
                <h3 className="font-bold text-slate-700">Update Documents</h3>
                <div className="mb-4 rounded-xl border-2 border-dashed border-slate-200 bg-white p-6 text-center">
                  <input
                    type="file"
                    id="edit-file-upload"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx,.ppt,.pptx"
                    disabled={uploading}
                  />
                  <label htmlFor="edit-file-upload" className="cursor-pointer">
                    {uploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="animate-spin text-brand-500" size={32} />
                        <p className="text-sm font-medium text-slate-600">Uploading... {Math.round(uploadProgress)}%</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="text-slate-400" size={32} />
                        <p className="text-sm font-medium text-slate-600">Upload new document</p>
                      </div>
                    )}
                  </label>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
                  <input
                    type="text"
                    placeholder="Doc Title"
                    value={newDoc.title}
                    onChange={e => setNewDoc({ ...newDoc, title: e.target.value })}
                    className="rounded-lg border border-slate-200 p-2 text-sm focus:outline-none sm:col-span-1"
                  />
                  <input
                    type="text"
                    placeholder="Doc URL"
                    value={newDoc.url}
                    readOnly
                    className="rounded-lg border border-slate-200 bg-slate-100 p-2 text-sm focus:outline-none sm:col-span-1"
                  />
                  <select
                    value={newDoc.type}
                    onChange={e => setNewDoc({ ...newDoc, type: e.target.value as any })}
                    className="rounded-lg border border-slate-200 p-2 text-sm focus:outline-none sm:col-span-1"
                  >
                    <option value="pdf">PDF</option>
                    <option value="doc">DOC</option>
                    <option value="ppt">PPT</option>
                  </select>
                  <button
                    onClick={handleAddDocToExisting}
                    className="rounded-lg bg-brand-500 p-2 text-white hover:bg-brand-600 sm:col-span-1"
                  >
                    Add Document
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(editData.documents || []).map((doc: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium shadow-sm">
                      <span className="uppercase text-brand-500">{doc.type}</span>: {doc.title}
                      <button onClick={() => handleRemoveDocFromExisting(i)} className="text-red-500 hover:text-red-700">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Independent Video Update */}
              <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50 p-6">
                <h3 className="font-bold text-slate-700">Update Video Link</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="YouTube/Video Embed URL"
                    value={editData.videoUrl || ''}
                    onChange={e => setEditData({ ...editData, videoUrl: e.target.value })}
                    className="flex-grow rounded-xl border border-slate-200 p-3 focus:outline-none"
                  />
                  <button 
                    onClick={() => handleUpdateChapterField('videoUrl', editData.videoUrl)}
                    className="rounded-xl bg-slate-900 px-6 py-2 text-white hover:bg-slate-800"
                  >
                    Save Video
                  </button>
                </div>
              </div>

              {/* Independent Quiz Update */}
              <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50 p-6">
                <h3 className="font-bold text-slate-700">Update Quiz HTML</h3>
                <textarea
                  placeholder="Paste Quiz HTML here"
                  value={editData.quizHtml || ''}
                  onChange={e => setEditData({ ...editData, quizHtml: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-3 focus:outline-none"
                  rows={4}
                />
                <button 
                  onClick={() => handleUpdateChapterField('quizHtml', editData.quizHtml)}
                  className="w-full rounded-xl bg-slate-900 py-3 text-white hover:bg-slate-800"
                >
                  Save Quiz
                </button>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            {chapters.map(ch => (
              <div key={ch.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-6">
                <div>
                  <h3 className="text-lg font-bold">{ch.title}</h3>
                  <p className="text-sm text-slate-500">
                    {classes.find(c => c.id === ch.classId)?.name} • {subjects.find(s => s.id === ch.subjectId)?.name}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEditChapter(ch)}
                    className="rounded-xl bg-white p-2 text-slate-600 shadow-sm hover:bg-slate-50"
                  >
                    <Edit size={20} />
                  </button>
                  <button onClick={() => setDeleteConfirm({ coll: 'chapters', id: ch.id })} className="text-red-500 hover:text-red-700">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
