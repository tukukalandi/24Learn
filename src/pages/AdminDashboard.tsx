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

  const handleDelete = async (coll: string, id: string) => {
    if (confirm('Are you sure?')) {
      try {
        await deleteDoc(doc(db, coll, id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `${coll}/${id}`);
      }
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-12 font-display text-4xl font-bold text-brand-500">Admin Dashboard</h1>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Classes Management */}
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-2xl font-bold">Manage Classes</h2>
          <form onSubmit={handleAddClass} className="mb-8 flex gap-4">
            <input
              type="text"
              placeholder="Class Name (e.g. Class 10)"
              value={newClass.name}
              onChange={e => setNewClass({ ...newClass, name: e.target.value })}
              className="flex-grow rounded-xl border border-slate-200 p-3 focus:border-brand-500 focus:outline-none"
              required
            />
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
          </form>
          <div className="space-y-2">
            {classes.map(c => (
              <div key={c.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                <span className="font-bold">{c.name} (Order: {c.order})</span>
                <button onClick={() => handleDelete('classes', c.id)} className="text-red-500 hover:text-red-700">
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
                <button onClick={() => handleDelete('subjects', s.id)} className="text-red-500 hover:text-red-700">
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Chapters Management */}
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm lg:col-span-2">
          <h2 className="mb-6 text-2xl font-bold">Manage Chapters</h2>
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
          
          <div className="space-y-4">
            {chapters.map(ch => (
              <div key={ch.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-6">
                <div>
                  <h3 className="text-lg font-bold">{ch.title}</h3>
                  <p className="text-sm text-slate-500">
                    {classes.find(c => c.id === ch.classId)?.name} • {subjects.find(s => s.id === ch.subjectId)?.name}
                  </p>
                </div>
                <button onClick={() => handleDelete('chapters', ch.id)} className="text-red-500 hover:text-red-700">
                  <Trash2 size={24} />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
