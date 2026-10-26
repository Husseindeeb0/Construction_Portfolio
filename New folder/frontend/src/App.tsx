import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { Provider } from 'react-redux'
import { store } from '../store'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { LoginPage } from './pages/Login'
import { RegisterPage } from './pages/Register'
import HomePage from './pages/Home'
import CompanyDashboard from './pages/Dashboards/CompanyDashboard'
import HeroDashboard from './pages/Dashboards/HeroDashboard'
import AboutDashboard from './pages/Dashboards/AboutDashboard'
import ServiceDashboard from './pages/Dashboards/ServiceDashboard'
import RecordDashboard from './pages/Dashboards/RecordDashboard'
import ProjectDashboard from './pages/Dashboards/ProjectDashboard'
import CategoryDashboard from './pages/Dashboards/CategoryDashboard'

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Admin Dashboard */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard/company" element={<CompanyDashboard />} />
              <Route path="/dashboard/hero" element={<HeroDashboard />} />
              <Route path="/dashboard/about" element={<AboutDashboard />} />
              <Route path="/dashboard/services" element={<ServiceDashboard />} />
              <Route path="/dashboard/records" element={<RecordDashboard />} />
              <Route path="/dashboard/projects" element={<ProjectDashboard />} />
              <Route path="/dashboard/categories" element={<CategoryDashboard />} />
            </Route>
          </Route>

          {/* Convenience redirect */}
          <Route path="/dashboard" element={<Navigate to="/dashboard/company" replace />} />

          {/* 404 fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  )
}

export default App
