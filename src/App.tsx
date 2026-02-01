import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, NotesProvider } from '@/contexts';
import { Layout } from '@/components/layout';
import { ProtectedRoute } from '@/components/auth';
import {
  LoginPage,
  DashboardPage,
  PatientsPage,
  PatientNotesPage,
  NoteDetailPage,
} from '@/pages';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotesProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected routes */}
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<DashboardPage />} />
              <Route path="/patients" element={<PatientsPage />} />
              <Route path="/patients/:patientId/notes" element={<PatientNotesPage />} />
              <Route path="/patients/:patientId/notes/:noteId" element={<NoteDetailPage />} />
              <Route path="/notes" element={<PatientsPage />} />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<LoginPage />} />
          </Routes>
        </NotesProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
