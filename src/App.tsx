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
  DashboardPage,
  LearnMorePage,
  PublicRegistrationPage,
} from './pages';
import { ResetPasswordPage } from './pages/auth';
import { CasesListPage, CaseDetailPage, CaseFormPage } from './pages/cases';
import { ReferralsPage } from './pages/referrals';
import { RegistrationsPage } from './pages/registrations';
import { UsersListPage, UserDetailPage, UserFormPage } from './pages/users';
import { ReportsPage } from './pages/reports';
import { SettingsPage } from './pages/settings';
import { AdminDashboardPage } from './pages/admin';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <Router>
            <Routes>
              <Route path="/" element={<WelcomePage />} />
              <Route path="/learn-more" element={<LearnMorePage />} />
              <Route path="/register" element={<PublicRegistrationPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
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
                path="/cases/edit/:id"
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
                path="/referrals"
                element={
                  <ProtectedRoute>
                    <ReferralsPage />
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
                path="/users"
                element={
                  <ProtectedRoute>
                    <UsersListPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users/create"
                element={
                  <ProtectedRoute>
                    <UserFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users/edit/:id"
                element={
                  <ProtectedRoute>
                    <UserFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users/:id"
                element={
                  <ProtectedRoute>
                    <UserDetailPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/reports"
                element={
                  <ProtectedRoute>
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
                  <ProtectedRoute allowedRoles={['admin', 'organization']}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
