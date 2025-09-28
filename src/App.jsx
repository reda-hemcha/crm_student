import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import { Toaster } from 'react-hot-toast'
import store from './store'
import config from './config/environment'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AdminRoute from './components/auth/AdminRoute'
import LoginPage from './pages/auth/LoginPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import StudentsPage from './pages/students/StudentsPage'
import ClassesPage from './pages/classes/ClassesPage'
import MessagesPage from './pages/messages/MessagesPage'
import OneToOnePage from './pages/messages/OneToOnePage'
import BroadcastPage from './pages/messages/BroadcastPage'
import InboxPage from './pages/inbox/InboxPage'
import SettingsPage from './pages/settings/SettingsPage'
import HelpPage from './pages/help/HelpPage'
import SchoolsPage from './pages/admin/SchoolsPage'
import AdminsPage from './pages/admin/AdminsPage'
import WhatsAppConfigPage from './pages/admin/whatsapp/WhatsAppConfigPage'
import WhatsAppTestingPage from './pages/admin/whatsapp/WhatsAppTestingPage'

function App() {
  // Log configuration in development mode
  useEffect(() => {
    if (config.IS_DEVELOPMENT) {
      console.log('🚀 CRM School Management System')
      console.log('📡 Backend URL:', config.API_BASE_URL)
      console.log('🏗️ Environment:', config.NODE_ENV)
      console.log('📦 App Version:', config.APP_VERSION)
    }
  }, [])

  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected Routes with Layout */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout title="Dashboard">
                  <DashboardPage />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout title="Dashboard">
                  <DashboardPage />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/students" element={
              <ProtectedRoute>
                <Layout title="Students">
                  <StudentsPage />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/classes" element={
              <ProtectedRoute>
                <Layout title="Classes">
                  <ClassesPage />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/messages" element={
              <ProtectedRoute>
                <Layout title="Messages">
                  <MessagesPage />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/messages/one-to-one" element={
              <ProtectedRoute>
                <Layout title="One-to-One Message">
                  <OneToOnePage />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/messages/broadcast" element={
              <ProtectedRoute>
                <Layout title="Broadcast Messages">
                  <BroadcastPage />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/inbox" element={
              <ProtectedRoute>
                <Layout title="Inbox">
                  <InboxPage />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/settings" element={
              <ProtectedRoute>
                <Layout title="Settings">
                  <SettingsPage />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/help" element={
              <ProtectedRoute>
                <Layout title="Help & Docs">
                  <HelpPage />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Admin Routes - Only for SUPER_ADMIN */}
            <Route path="/admin/schools" element={
              <ProtectedRoute>
                <AdminRoute>
                  <Layout title="Schools Management">
                    <SchoolsPage />
                  </Layout>
                </AdminRoute>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/admins" element={
              <ProtectedRoute>
                <AdminRoute>
                  <Layout title="Admins Management">
                    <AdminsPage />
                  </Layout>
                </AdminRoute>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/whatsapp/config" element={
              <ProtectedRoute>
                <AdminRoute>
                  <Layout title="WhatsApp Configuration">
                    <WhatsAppConfigPage />
                  </Layout>
                </AdminRoute>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/whatsapp/testing" element={
              <ProtectedRoute>
                <AdminRoute>
                  <Layout title="WhatsApp Testing">
                    <WhatsAppTestingPage />
                  </Layout>
                </AdminRoute>
              </ProtectedRoute>
            } />
            
            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </div>
      </Router>
    </Provider>
  )
}

export default App