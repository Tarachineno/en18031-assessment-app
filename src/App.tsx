import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts';
import { ProtectedRoute } from './components/auth';
import { AppLayout } from './components/layout';
import { Dashboard } from './components/dashboard';
import { ProjectList } from './components/project';
import { ProjectDetail } from './components/project/ProjectDetail';
import { AssessmentList } from './components/assessment';
import { AssessmentExecution } from './components/assessment/AssessmentExecution';
import { EvidenceManager } from './components/evidence';
import { ReportsList } from './components/reports';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ProtectedRoute>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/projects" element={<ProjectList />} />
              <Route path="/projects/:id" element={<ProjectDetail />} />
              <Route path="/assessments" element={<AssessmentList />} />
              <Route path="/projects/:projectId/assessments/:testCaseId" element={<AssessmentExecution />} />
              <Route path="/evidence" element={<EvidenceManager />} />
              <Route path="/reports" element={<ReportsList />} />
            </Routes>
          </AppLayout>
        </ProtectedRoute>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
