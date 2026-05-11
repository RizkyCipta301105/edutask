import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/common/ProtectedRoute'
import GuestRoute from './components/common/GuestRoute'

// Pages
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import TaskManagementPage from './pages/TaskManagementPage'
import SchedulePage from './pages/SchedulePage'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Guest only routes - redirect to dashboard if already logged in */}
        <Route element={<GuestRoute />}>
          <Route path="/login"       element={<LoginPage />} />
          <Route path="/login/dosen" element={<LoginPage mode="dosen" />} />
          <Route path="/register"            element={<RegisterPage type="mahasiswa" />} />
          <Route path="/register/mahasiswa"  element={<RegisterPage type="mahasiswa" />} />
          <Route path="/register/umum"       element={<RegisterPage type="umum" />} />
          <Route path="/register/dosen"      element={<RegisterPage type="dosen" />} />
        </Route>

        {/* Protected routes - redirect to login if not authenticated */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/mahasiswa" element={<DashboardPage roleView="mahasiswa" />} />
          <Route path="/dashboard/dosen"     element={<DashboardPage roleView="dosen" />} />
          <Route path="/dashboard/umum"      element={<DashboardPage roleView="umum" />} />
          <Route path="/tasks"     element={<TaskManagementPage />} />
          <Route path="/schedule"  element={<SchedulePage />} />
          <Route path="/profile"   element={<ProfilePage />} />
        </Route>

        {/* Default redirects */}
        <Route path="/"  element={<Navigate to="/dashboard" replace />} />
        <Route path="*"  element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  )
}
