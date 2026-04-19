/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { FloatingBackButton } from './components/FloatingBackButton';
import { Breadcrumbs } from './components/Breadcrumbs';
import { Home } from './pages/Home';
import { ClassView } from './pages/ClassView';
import { SubjectView } from './pages/SubjectView';
import { ChapterView } from './pages/ChapterView';
import { CompetitiveExams } from './pages/CompetitiveExams';
import { POGuide } from './pages/POGuide';
import { BDBranch } from './pages/BDBranch';
import { Rules } from './pages/Rules';
import { Contact } from './pages/Contact';
import { AccountantExam } from './pages/AccountantExam';
import { SavingsBranch } from './pages/SavingsBranch';
import { OtherBranch } from './pages/OtherBranch';
import { SearchResults } from './pages/SearchResults';
import { InternalPortal } from './pages/InternalPortal';
import { PublicPortal } from './pages/PublicPortal';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <Breadcrumbs />
          <FloatingBackButton />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/internal-portal" element={<InternalPortal />} />
              <Route path="/portal/:categorySlug" element={<PublicPortal />} />
              <Route path="/rules" element={<Rules />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/exams/accountant" element={<AccountantExam />} />
              <Route path="/branch/savings" element={<SavingsBranch />} />
              <Route path="/branch/other" element={<OtherBranch />} />
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
