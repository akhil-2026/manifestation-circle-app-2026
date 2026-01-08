import { useState, useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

const Alert = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'info', 
  confirmText = 'OK', 
  cancelText = 'Cancel', 
  onConfirm, 
  onCancel,
  showCancel = false,
  autoClose = false,
  autoCloseDelay = 3000
}) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      if (autoClose) {
        const timer = setTimeout(() => {
          handleClose()
        }, autoCloseDelay)
        return () => clearTimeout(timer)
      }
    } else {
      setIsVisible(false)
    }
  }, [isOpen, autoClose, autoCloseDelay])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => {
      onClose()
    }, 200) // Wait for animation to complete
  }

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm()
    }
    handleClose()
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    }
    handleClose()
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-500" />
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />
      case 'info':
      default:
        return <Info className="w-6 h-6 text-blue-500" />
    }
  }

  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          border: 'border-green-500',
          bg: 'bg-green-900/20',
          text: 'text-green-200'
        }
      case 'error':
        return {
          border: 'border-red-500',
          bg: 'bg-red-900/20',
          text: 'text-red-200'
        }
      case 'warning':
        return {
          border: 'border-yellow-500',
          bg: 'bg-yellow-900/20',
          text: 'text-yellow-200'
        }
      case 'info':
      default:
        return {
          border: 'border-blue-500',
          bg: 'bg-blue-900/20',
          text: 'text-blue-200'
        }
    }
  }

  if (!isOpen) return null

  const colors = getColors()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-200 ${
          isVisible ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Alert Box */}
      <div 
        className={`relative bg-dark-900 border-2 ${colors.border} rounded-xl shadow-2xl max-w-md w-full transform transition-all duration-200 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Header */}
        <div className={`${colors.bg} p-4 rounded-t-xl border-b ${colors.border}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getIcon()}
              <h3 className="text-lg font-bold text-white">
                {title}
              </h3>
            </div>
            <button
              onClick={handleClose}
              className="text-dark-400 hover:text-white transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className={`text-base leading-relaxed ${colors.text}`}>
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 p-6 pt-0">
          {showCancel && (
            <button
              onClick={handleCancel}
              className="btn-secondary text-sm px-4 py-2"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={handleConfirm}
            className="btn-primary text-sm px-4 py-2"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Alert