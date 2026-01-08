import { useState, useEffect } from 'react'

export const usePWA = () => {
  const [isInstalled, setIsInstalled] = useState(false)
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [canInstall, setCanInstall] = useState(false)

  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return

    // Check if app is installed
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                          window.navigator.standalone === true
      setIsInstalled(isStandalone)
    }

    // Handle install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setCanInstall(true)
    }

    // Handle app installed
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setCanInstall(false)
      setDeferredPrompt(null)
    }

    // Handle online/offline status
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    // Add event listeners
    checkInstalled()
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const installApp = async () => {
    if (!deferredPrompt) return false

    try {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('✅ PWA: User accepted install')
        return true
      } else {
        console.log('❌ PWA: User dismissed install')
        return false
      }
    } catch (error) {
      console.error('❌ PWA: Install failed:', error)
      return false
    } finally {
      setDeferredPrompt(null)
      setCanInstall(false)
    }
  }

  const shareApp = async (data = {}) => {
    // Only run in browser environment
    if (typeof window === 'undefined') return false

    const shareData = {
      title: 'Manifestation Circle',
      text: 'Transform your reality through daily manifestation practice 🌙✨',
      url: window.location.origin,
      ...data
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
        return true
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareData.url)
        return true
      }
    } catch (error) {
      console.error('❌ PWA: Share failed:', error)
      return false
    }
  }

  const requestPersistentStorage = async () => {
    if (typeof navigator === 'undefined' || !('storage' in navigator) || !('persist' in navigator.storage)) {
      return false
    }

    try {
      const persistent = await navigator.storage.persist()
      console.log('💾 PWA: Persistent storage:', persistent)
      return persistent
    } catch (error) {
      console.error('❌ PWA: Persistent storage request failed:', error)
      return false
    }
  }

  const getStorageEstimate = async () => {
    if (typeof navigator === 'undefined' || !('storage' in navigator) || !('estimate' in navigator.storage)) {
      return null
    }

    try {
      const estimate = await navigator.storage.estimate()
      return {
        quota: estimate.quota,
        usage: estimate.usage,
        usagePercentage: estimate.usage / estimate.quota * 100
      }
    } catch (error) {
      console.error('❌ PWA: Storage estimate failed:', error)
      return null
    }
    return null
  }

  return {
    isInstalled,
    isOnline,
    canInstall,
    installApp,
    shareApp,
    requestPersistentStorage,
    getStorageEstimate
  }
}