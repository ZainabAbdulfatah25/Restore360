import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { queryClient } from './utils/queryClient';
import {
  LoginPage,
  SignupPage,
  ForgotPasswordPage,
  WelcomePage,
  LearnMorePage,
  DashboardPage,
  UsersListPage,
  UserFormPage,
  UserDetailPage,
  CasesListPage,
  CaseFormPage,
  CaseDetailPage,
  RegistrationsPage,
  ReferralsPage,
  ReportsPage,
  SettingsPage,
  AdminDashboardPage,
} from './pages';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <UsersListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users/create"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <UserFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users/:id"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <UserDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users/:id/edit"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <UserFormPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/cases"
              element={
                <ProtectedRoute>
                  <CasesListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cases/create"
              element={
                <ProtectedRoute>
                  <CaseFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cases/:id"
              element={
                <ProtectedRoute>
                  <CaseDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cases/:id/edit"
              element={
                <ProtectedRoute>
                  <CaseFormPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/registrations"
              element={
                <ProtectedRoute>
                  <RegistrationsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/referrals"
              element={
                <ProtectedRoute>
                  <ReferralsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/reports"
              element={
                <ProtectedRoute allowedRoles={['admin', 'case_worker']}>
                  <ReportsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin', 'case_worker']}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />

            <Route path="/" element={<WelcomePage />} />
            <Route path="/learn-more" element={<LearnMorePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
