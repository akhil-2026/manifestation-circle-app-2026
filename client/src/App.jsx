import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import MirrorMode from './pages/MirrorMode'
import Calendar from './pages/Calendar'
import GroupView from './pages/GroupView'
import Admin from './pages/Admin'
import SuperAdmin from './pages/SuperAdmin'
import SuperAdminTest from './pages/SuperAdminTest'
import Profile from './pages/Profile'
import UserCalendar from './components/UserCalendar'
import LoadingSpinner from './components/LoadingSpinner'
import NotificationPrompt from './components/NotificationPrompt'
import PWAInstallPrompt from './components/PWAInstallPrompt'
import OfflineIndicator from './components/OfflineIndicator'
import PWAUpdateNotification from './components/PWAUpdateNotification'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <LoadingSpinner />
  }
  
  return user ? children : <Navigate to="/login" />
}

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <LoadingSpinner />
  }
  
  return user ? <Navigate to="/dashboard" /> : children
}

function AppContent() {
  const { loading, user } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Navbar />
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/mirror" element={
            <ProtectedRoute>
              <MirrorMode />
            </ProtectedRoute>
          } />
          <Route path="/calendar" element={
            <ProtectedRoute>
              <Navbar />
              <Calendar />
            </ProtectedRoute>
          } />
          <Route path="/calendar/:userId" element={
            <ProtectedRoute>
              <Navbar />
              <UserCalendar />
            </ProtectedRoute>
          } />
          <Route path="/group" element={
            <ProtectedRoute>
              <Navbar />
              <GroupView />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute>
              <Navbar />
              <Admin />
            </ProtectedRoute>
          } />
          <Route path="/super-admin" element={
            <ProtectedRoute>
              <Navbar />
              <SuperAdmin />
            </ProtectedRoute>
          } />
          <Route path="/super-admin-test" element={
            <ProtectedRoute>
              <Navbar />
              <SuperAdminTest />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Navbar />
              <Profile />
            </ProtectedRoute>
          } />
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
        {/* PWA Components */}
        <PWAUpdateNotification />
        <OfflineIndicator />
        <PWAInstallPrompt />
        {/* Show notification prompt only for authenticated users */}
        {user && <NotificationPrompt />}
      </Router>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App