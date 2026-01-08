import React, { useState, useEffect } from 'react'
import { WifiOff, Wifi, AlertCircle } from 'lucide-react'

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showOfflineMessage, setShowOfflineMessage] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 PWA: Back online')
      setIsOnline(true)
      setShowOfflineMessage(false)
    }

    const handleOffline = () => {
      console.log('📴 PWA: Gone offline')
      setIsOnline(false)
      setShowOfflineMessage(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Show offline message if already offline
    if (!navigator.onLine) {
      setShowOfflineMessage(true)
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Auto-hide offline message after 5 seconds when back online
  useEffect(() => {
    if (isOnline && showOfflineMessage) {
      const timer = setTimeout(() => {
        setShowOfflineMessage(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isOnline, showOfflineMessage])

  if (!showOfflineMessage) {
    return null
  }

  return (
    <div className={`fixed top-16 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-40 transition-all duration-300 ${
      isOnline ? 'translate-y-0' : 'translate-y-0'
    }`}>
      <div className={`rounded-lg shadow-lg p-3 ${
        isOnline 
          ? 'bg-green-500 text-white' 
          : 'bg-orange-500 text-white'
      }`}>
        <div className="flex items-center space-x-2">
          {isOnline ? (
            <Wifi className="w-4 h-4" />
          ) : (
            <WifiOff className="w-4 h-4" />
          )}
          <div className="flex-1">
            <p className="text-sm font-medium">
              {isOnline ? 'Back Online!' : 'You\'re Offline'}
            </p>
            <p className="text-xs opacity-90">
              {isOnline 
                ? 'All features are now available' 
                : 'Some features may be limited'
              }
            </p>
          </div>
          {!isOnline && (
            <AlertCircle className="w-4 h-4" />
          )}
        </div>
        
        {!isOnline && (
          <div className="mt-2 text-xs opacity-90">
            <p>• View cached manifestations</p>
            <p>• Changes will sync when online</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default OfflineIndicator