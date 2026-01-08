import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const SuperAdminTest = () => {
  const { user } = useAuth()
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    checkSuperAdminStatus()
  }, [])

  const checkSuperAdminStatus = async () => {
    try {
      setLoading(true)
      
      // Test 1: Check debug status
      const debugResponse = await axios.get('/super-admin/debug/status')
      console.log('Debug Response:', debugResponse.data)
      
      // Test 2: Try to access dashboard
      const dashboardResponse = await axios.get('/super-admin/dashboard')
      console.log('Dashboard Response:', dashboardResponse.data)
      
      setStatus({
        debug: debugResponse.data,
        dashboard: dashboardResponse.data,
        hasAccess: true
      })
    } catch (err) {
      console.error('Super Admin Test Error:', err)
      setError({
        message: err.response?.data?.message || err.message,
        status: err.response?.status,
        debug: err.response?.data
      })
      
      // Try just the debug endpoint
      try {
        const debugResponse = await axios.get('/super-admin/debug/status')
        setStatus({
          debug: debugResponse.data,
          dashboard: null,
          hasAccess: false,
          error: err.response?.data?.message
        })
      } catch (debugErr) {
        setError({
          message: 'Cannot access any super admin endpoints',
          debugError: debugErr.response?.data?.message
        })
      }
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="card">
          <h1 className="text-2xl font-bold text-white mb-4">Super Admin Test</h1>
          <p className="text-red-400">Please login first</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="card">
        <h1 className="text-2xl font-bold text-white mb-6">Super Admin System Test</h1>
        
        {/* Current User Info */}
        <div className="mb-6 p-4 bg-dark-800 rounded-lg">
          <h2 className="text-lg font-semibold text-white mb-2">Current User</h2>
          <p className="text-dark-300">Email: {user.email}</p>
          <p className="text-dark-300">Role: {user.role}</p>
          <p className="text-dark-300">ID: {user.id}</p>
        </div>

        {/* Test Results */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            <span className="ml-2 text-white">Testing Super Admin access...</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
            <h2 className="text-lg font-semibold text-red-400 mb-2">Error</h2>
            <pre className="text-red-300 text-sm overflow-auto">
              {JSON.stringify(error, null, 2)}
            </pre>
          </div>
        )}

        {status && (
          <div className="space-y-4">
            {/* Debug Status */}
            <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
              <h2 className="text-lg font-semibold text-blue-400 mb-2">Debug Status</h2>
              <pre className="text-blue-300 text-sm overflow-auto">
                {JSON.stringify(status.debug, null, 2)}
              </pre>
            </div>

            {/* Dashboard Access */}
            {status.dashboard && (
              <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                <h2 className="text-lg font-semibold text-green-400 mb-2">Dashboard Access ✅</h2>
                <pre className="text-green-300 text-sm overflow-auto">
                  {JSON.stringify(status.dashboard, null, 2)}
                </pre>
              </div>
            )}

            {/* Access Summary */}
            <div className={`p-4 rounded-lg border ${
              status.hasAccess 
                ? 'bg-green-900/20 border-green-500/30' 
                : 'bg-red-900/20 border-red-500/30'
            }`}>
              <h2 className={`text-lg font-semibold mb-2 ${
                status.hasAccess ? 'text-green-400' : 'text-red-400'
              }`}>
                Super Admin Access: {status.hasAccess ? '✅ GRANTED' : '❌ DENIED'}
              </h2>
              {status.error && (
                <p className="text-red-300 text-sm">{status.error}</p>
              )}
            </div>
          </div>
        )}

        {/* Manual Test Buttons */}
        <div className="mt-6 space-y-2">
          <button
            onClick={checkSuperAdminStatus}
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading ? 'Testing...' : 'Retest Super Admin Access'}
          </button>
          
          <button
            onClick={() => window.location.href = '/super-admin'}
            className="btn-secondary w-full"
          >
            Try Super Admin Panel
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
          <h2 className="text-lg font-semibold text-yellow-400 mb-2">Instructions</h2>
          <ul className="text-yellow-300 text-sm space-y-1">
            <li>1. Make sure SUPER_ADMIN_EMAIL is set in Render backend</li>
            <li>2. Your email must match exactly: akhilkrishna2400@gmail.com</li>
            <li>3. You must be logged in with the Super Admin email</li>
            <li>4. If debug shows isSuperAdmin: true, access should work</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default SuperAdminTest