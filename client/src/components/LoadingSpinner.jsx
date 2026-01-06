import React from 'react'

const LoadingSpinner = ({ size = 'md', text = 'Loading...', variant = 'fullscreen', className = '' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  }

  // Inline spinner for buttons and forms
  if (variant === 'inline') {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <div className={`${sizeClasses.sm} relative overflow-hidden rounded-full bg-gradient-to-br from-purple-600 to-purple-800`}>
          <div className="absolute inset-0 bg-dark-950 rounded-full transform translate-x-1/2 animate-spin-slow"></div>
        </div>
        {text && <span className="ml-2 text-sm">{text}</span>}
      </div>
    )
  }

  // Button spinner
  if (variant === 'button') {
    return (
      <div className={`${sizeClasses.sm} relative overflow-hidden rounded-full bg-gradient-to-br from-purple-400 to-purple-600`}>
        <div className="absolute inset-0 bg-white rounded-full transform translate-x-1/2 animate-spin-slow"></div>
      </div>
    )
  }

  // Full screen mystical loading
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-dark-950">
      {/* Half Moon Loading Spinner */}
      <div className="relative animate-float">
        {/* Outer glow ring */}
        <div className={`${sizeClasses[size]} absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 animate-pulse`}></div>
        
        {/* Main half moon */}
        <div className={`${sizeClasses[size]} relative overflow-hidden rounded-full bg-gradient-to-br from-purple-600 to-purple-800 shadow-2xl`}>
          {/* Half moon shape */}
          <div className="absolute inset-0 bg-dark-950 rounded-full transform translate-x-1/2 animate-spin-slow"></div>
          
          {/* Inner glow */}
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-purple-400/30 to-pink-400/30 animate-pulse"></div>
          
          {/* Stars around the moon */}
          <div className="absolute -top-1 -right-1 w-1 h-1 bg-yellow-300 rounded-full animate-twinkle"></div>
          <div className="absolute -bottom-1 -left-1 w-0.5 h-0.5 bg-blue-300 rounded-full animate-twinkle-delayed"></div>
          <div className="absolute top-1/2 -left-2 w-0.5 h-0.5 bg-purple-300 rounded-full animate-twinkle"></div>
          <div className="absolute top-0 left-1/2 w-0.5 h-0.5 bg-pink-300 rounded-full animate-twinkle-delayed"></div>
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

export default LoadingSpinner