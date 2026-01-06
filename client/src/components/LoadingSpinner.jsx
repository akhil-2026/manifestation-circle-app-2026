import React from 'react'

const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-dark-950">
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-dark-600 border-t-purple-500`}></div>
      {text && (
        <p className="mt-4 text-dark-400 text-sm">{text}</p>
      )}
    </div>
  )
}

export default LoadingSpinner