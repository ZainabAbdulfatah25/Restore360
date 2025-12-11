import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { queryClient } from './utils/queryClient';

// Core Pages
import { WelcomePage, LearnMorePage, PublicRegistrationPage } from './pages';
import { DashboardPage } from './pages/DashboardPage';
import { AdminDashboardPage } from './pages/admin';
import { SettingsPage } from './pages/settings';
import { ReportsPage } from './pages/reports';

// Auth Pages
import { LoginPage, SignupPage, ForgotPasswordPage, ResetPasswordPage } from './pages/auth';

// Feature Pages
import { CasesListPage, CaseDetailPage, CaseFormPage } from './pages/cases';
import { ReferralsPage } from './pages/referrals';
import { RegistrationsPage } from './pages/registrations';
import { UsersListPage, UserDetailPage, UserFormPage } from './pages/users';


function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<WelcomePage />} />
              <Route path="/learn-more" element={<LearnMorePage />} />
              <Route path="/register" element={<PublicRegistrationPage />} />
              
              {/* Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* Protected Routes (Using Direct Wrapper Pattern) */}
              
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
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

              {/* Case Routes */}
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

              {/* Referral Routes */}
              <Route
                path="/referrals"
                element={
                  <ProtectedRoute>
                    <ReferralsPage />
                  </ProtectedRoute>
                }
              />

              {/* Registration Routes */}
              <Route
                path="/registrations"
                element={
                  <ProtectedRoute>
                    <RegistrationsPage />
                  </ProtectedRoute>
                }
              />

              {/* User Routes */}
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
                path="/users/:id/edit"
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

              {/* Reports and Settings */}
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

              {/* Catch-all for 404 - redirects to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;