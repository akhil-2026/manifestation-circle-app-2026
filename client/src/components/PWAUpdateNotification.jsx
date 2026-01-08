import React, { useState, useEffect } from 'react'
import { RefreshCw, X } from 'lucide-react'

const PWAUpdateNotification = () => {
  const [showUpdate, setShowUpdate] = useState(false)
  const [registration, setRegistration] = useState(null)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg)
        
        // Listen for updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('🔄 PWA: New version available')
              setShowUpdate(true)
            }
          })
        })
      })
    }
  }, [])

  const handleUpdate = () => {
    if (registration && registration.waiting) {
      // Tell the waiting service worker to skip waiting and become active
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      
      // Reload the page to get the new version
      window.location.reload()
    }
  }

  const handleDismiss = () => {
    setShowUpdate(false)
  }

  if (!showUpdate) {
    return null
  }

  return (
    <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-2xl p-4 text-white">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-white/20 rounded-lg">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Update Available</h3>
              <p className="text-xs text-blue-100">New features and improvements</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-blue-200 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <p className="text-xs text-blue-100 mb-4">
          A new version of Manifestation Circle is ready. Update now to get the latest features and bug fixes.
        </p>
        
        <div className="flex space-x-2">
          <button
            onClick={handleUpdate}
            className="flex-1 bg-white text-blue-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors flex items-center justify-center space-x-1"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Update Now</span>
          </button>
          <button
            onClick={handleDismiss}
            className="px-3 py-2 text-blue-200 hover:text-white transition-colors text-sm"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  )
}

export default PWAUpdateNotification