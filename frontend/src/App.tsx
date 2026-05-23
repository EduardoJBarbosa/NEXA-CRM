import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import RouteGuard from '@/components/RouteGuard'
import Layout from '@/components/Layout'
import Login from '@/pages/Login'
import RegisterTenant from '@/pages/RegisterTenant'
import Dashboard from '@/pages/Dashboard'
import Leads from '@/pages/Leads'
import Patients from '@/pages/Patients'
import Appointments from '@/pages/Appointments'
import Financial from '@/pages/Financial'
import Settings from '@/pages/Settings'
import Billing from '@/pages/Billing'
import PlansPage from '@/pages/PlansPage'

function App() {
  const { initializeFromStorage } = useAuthStore()

  useEffect(() => {
    initializeFromStorage()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register-tenant" element={<RegisterTenant />} />

        <Route path="/plans" element={<PlansPage />} />

        <Route
          path="/dashboard"
          element={
            <RouteGuard>
              <Layout>
                <Dashboard />
              </Layout>
            </RouteGuard>
          }
        />

        <Route
          path="/leads"
          element={
            <RouteGuard>
              <Layout>
                <Leads />
              </Layout>
            </RouteGuard>
          }
        />

        <Route
          path="/patients"
          element={
            <RouteGuard>
              <Layout>
                <Patients />
              </Layout>
            </RouteGuard>
          }
        />

        <Route
          path="/appointments"
          element={
            <RouteGuard>
              <Layout>
                <Appointments />
              </Layout>
            </RouteGuard>
          }
        />

        <Route
          path="/financial"
          element={
            <RouteGuard>
              <Layout>
                <Financial />
              </Layout>
            </RouteGuard>
          }
        />

        <Route
          path="/billing"
          element={
            <RouteGuard>
              <Layout>
                <Billing />
              </Layout>
            </RouteGuard>
          }
        />

        <Route
          path="/settings"
          element={
            <RouteGuard>
              <Layout>
                <Settings />
              </Layout>
            </RouteGuard>
          }
        />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
