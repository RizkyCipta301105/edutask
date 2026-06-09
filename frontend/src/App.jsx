import React, { Suspense } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/common/ProtectedRoute'
import GuestRoute from './components/common/GuestRoute'
import RoleRoute from './components/common/RoleRoute'
import { AnimatePresence } from 'framer-motion'

// Lazy Loaded Pages
const LandingPage = React.lazy(() => import('./pages/LandingPage'))
const LoginPage = React.lazy(() => import('./pages/LoginPage'))
const RegisterPage = React.lazy(() => import('./pages/RegisterPage'))
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'))
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'))
const TaskManagementPage = React.lazy(() => import('./pages/TaskManagementPage'))
const SchedulePage = React.lazy(() => import('./pages/SchedulePage'))
const ForgotPasswordPage = React.lazy(() => import('./pages/ForgotPasswordPage'))
const ResetPasswordPage = React.lazy(() => import('./pages/ResetPasswordPage'))
const VerifyEmailPage = React.lazy(() => import('./pages/VerifyEmailPage'))
const CheckoutPage = React.lazy(() => import('./pages/CheckoutPage'))
const AboutPage = React.lazy(() => import('./pages/AboutPage'))
const CareersPage = React.lazy(() => import('./pages/CareersPage'))
const PrivacyPolicyPage = React.lazy(() => import('./pages/PrivacyPolicyPage'))
const BlogPage = React.lazy(() => import('./pages/BlogPage'))
const ContactPage = React.lazy(() => import('./pages/ContactPage'))

const LoadingFallback = () => (
  <div className="flex h-screen w-full items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      <p className="mt-4 text-sm font-medium text-gray-500">Memuat EduTask...</p>
    </div>
  </div>
)

export default function App() {
  const location = useLocation()

  return (
    <AuthProvider>
      <Suspense fallback={<LoadingFallback />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Public Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* Guest only routes - redirect to dashboard if already logged in */}
            <Route element={<GuestRoute />}>
              <Route path="/login"       element={<LoginPage />} />
              <Route path="/login/dosen" element={<LoginPage mode="dosen" />} />
              <Route path="/register"            element={<RegisterPage type="mahasiswa" />} />
              <Route path="/register/mahasiswa"  element={<RegisterPage type="mahasiswa" />} />
              <Route path="/register/umum"       element={<RegisterPage type="umum" />} />
              <Route path="/register/dosen"      element={<RegisterPage type="dosen" />} />
              <Route path="/forgot-password"     element={<ForgotPasswordPage />} />
              <Route path="/reset-password"      element={<ResetPasswordPage />} />
            </Route>

            {/* Public routes accessible to both guests and logged-in users */}
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/careers" element={<CareersPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* Protected routes - redirect to login if not authenticated */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route element={<RoleRoute allowedRoles={['mahasiswa']} />}>
                <Route path="/dashboard/mahasiswa" element={<DashboardPage roleView="mahasiswa" />} />
              </Route>
              <Route element={<RoleRoute allowedRoles={['dosen']} />}>
                <Route path="/dashboard/dosen" element={<DashboardPage roleView="dosen" />} />
              </Route>
              <Route element={<RoleRoute allowedRoles={['umum']} />}>
                <Route path="/dashboard/umum" element={<DashboardPage roleView="umum" />} />
              </Route>
              <Route path="/tasks" element={<TaskManagementPage />} />
              <Route path="/schedule" element={<SchedulePage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* 404 - redirect to landing page */}
            <Route path="*"  element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </AuthProvider>
  )
}
