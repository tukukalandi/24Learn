/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { ClassView } from './pages/ClassView';
import { SubjectView } from './pages/SubjectView';
import { ChapterView } from './pages/ChapterView';
import { CompetitiveExams } from './pages/CompetitiveExams';
import { POGuide } from './pages/POGuide';
import { BDBranch } from './pages/BDBranch';
import { Rules } from './pages/Rules';
import { Contact } from './pages/Contact';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/rules" element={<Rules />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/competitive-exams" element={<CompetitiveExams />} />
              <Route path="/exams/po-guide" element={<POGuide />} />
              <Route path="/branch/bd" element={<BDBranch />} />
              <Route path="/class/:classId" element={<ClassView />} />
              <Route path="/class/:classId/subject/:subjectId" element={<SubjectView />} />
              <Route path="/class/:classId/subject/:subjectId/chapter/:chapterId" element={<ChapterView />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}
