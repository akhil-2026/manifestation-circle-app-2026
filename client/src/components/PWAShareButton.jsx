import React from 'react'
import { Share2, Copy, Check } from 'lucide-react'
import { usePWA } from '../hooks/usePWA'
import useAlert from '../hooks/useAlert'

const PWAShareButton = ({ 
  title = "Manifestation Circle", 
  text = "Transform your reality through daily manifestation practice 🌙✨",
  url = typeof window !== 'undefined' ? window.location.origin : '',
  className = "",
  variant = "default" // default, icon, text
}) => {
  const { shareApp } = usePWA()
  const { showAlert } = useAlert()

  const handleShare = async () => {
    const success = await shareApp({ title, text, url })
    
    if (success) {
      if (navigator.share) {
        showAlert('Shared successfully! 🎉', 'success')
      } else {
        showAlert('Link copied to clipboard! 📋', 'success')
      }
    } else {
      showAlert('Failed to share. Please try again.', 'error')
    }
  }

  const baseClasses = "inline-flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
  
  const variants = {
    default: "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-lg",
    icon: "p-2 rounded-full bg-white/10 hover:bg-white/20 text-white",
    text: "text-purple-400 hover:text-purple-300 font-medium"
  }

  return (
    <button
      onClick={handleShare}
      className={`${baseClasses} ${variants[variant]} ${className}`}
      title="Share Manifestation Circle"
    >
      {variant === 'icon' ? (
        <Share2 className="w-5 h-5" />
      ) : (
        <>
          <Share2 className="w-4 h-4 mr-2" />
          <span>Share App</span>
        </>
      )}
    </button>
  )
}

export default PWAShareButton