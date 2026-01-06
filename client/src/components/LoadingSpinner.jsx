import React from 'react'
import { Moon } from 'lucide-react'

const LoadingSpinner = ({ size = 'md', text = 'Loading...', variant = 'fullscreen', className = '' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }

  // Inline spinner for buttons and forms
  if (variant === 'inline') {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <Moon className={`${iconSizes.sm} text-purple-500 animate-spin-slow`} />
        {text && <span className="ml-2 text-sm">{text}</span>}
      </div>
    )
  }

  // Button spinner
  if (variant === 'button') {
    return (
      <Moon className={`${iconSizes.sm} text-white animate-spin-slow`} />
    )
  }

  // Full screen mystical loading with Moon icon (build fix)
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-dark-950">
      {/* Moon Loading Spinner */}
      <div className="relative animate-float">
        {/* Outer glow ring */}
        <div className={`${sizeClasses[size]} absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 animate-pulse`}></div>
        
        {/* Main Moon Icon Container */}
        <div className={`${sizeClasses[size]} relative flex items-center justify-center rounded-full bg-gradient-to-br from-purple-600/20 to-purple-800/20 shadow-2xl backdrop-blur-sm border border-purple-500/30`}>
          {/* Moon Icon */}
          <Moon className={`${iconSizes[size]} text-purple-400 animate-spin-slow animate-moon-glow drop-shadow-lg`} />
          
          {/* Inner glow */}
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-purple-400/10 to-pink-400/10 animate-pulse"></div>
          
          {/* Stars around the moon */}
          <div className="absolute -top-1 -right-1 w-1 h-1 bg-yellow-300 rounded-full animate-twinkle"></div>
          <div className="absolute -bottom-1 -left-1 w-0.5 h-0.5 bg-blue-300 rounded-full animate-twinkle-delayed"></div>
          <div className="absolute top-1/2 -left-2 w-0.5 h-0.5 bg-purple-300 rounded-full animate-twinkle"></div>
          <div className="absolute top-0 left-1/2 w-0.5 h-0.5 bg-pink-300 rounded-full animate-twinkle-delayed"></div>
          <div className="absolute bottom-1/4 -right-2 w-0.5 h-0.5 bg-indigo-300 rounded-full animate-twinkle"></div>
        </div>
        
        {/* Rotating outer ring */}
        <div className={`${sizeClasses[size]} absolute inset-0 border-2 border-transparent border-t-purple-400 border-r-pink-400 rounded-full animate-spin opacity-60`}></div>
      </div>

      {/* Loading text with mystical effect */}
      {text && (
        <div className="mt-8 text-center">
          <p className="text-purple-300 text-lg font-light tracking-wide animate-pulse">
            {text}
          </p>
          <div className="flex justify-center mt-2 space-x-1">
            <div className="w-1 h-1 bg-purple-400 rounded-full animate-bounce"></div>
            <div className="w-1 h-1 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-1 h-1 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LoadingSpinner