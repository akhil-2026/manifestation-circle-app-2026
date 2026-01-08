import { useState } from 'react'

const useAlert = () => {
  const [alert, setAlert] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    confirmText: 'OK',
    cancelText: 'Cancel',
    showCancel: false,
    onConfirm: null,
    onCancel: null,
    autoClose: false,
    autoCloseDelay: 3000
  })

  const showAlert = ({
    title,
    message,
    type = 'info',
    confirmText = 'OK',
    cancelText = 'Cancel',
    showCancel = false,
    onConfirm = null,
    onCancel = null,
    autoClose = false,
    autoCloseDelay = 3000
  }) => {
    setAlert({
      isOpen: true,
      title,
      message,
      type,
      confirmText,
      cancelText,
      showCancel,
      onConfirm,
      onCancel,
      autoClose,
      autoCloseDelay
    })
  }

  const hideAlert = () => {
    setAlert(prev => ({ ...prev, isOpen: false }))
  }

  // Convenience methods for different alert types
  const showSuccess = (title, message, options = {}) => {
    showAlert({
      title,
      message,
      type: 'success',
      autoClose: true,
      ...options
    })
  }

  const showError = (title, message, options = {}) => {
    showAlert({
      title,
      message,
      type: 'error',
      ...options
    })
  }

  const showWarning = (title, message, options = {}) => {
    showAlert({
      title,
      message,
      type: 'warning',
      ...options
    })
  }

  const showInfo = (title, message, options = {}) => {
    showAlert({
      title,
      message,
      type: 'info',
      ...options
    })
  }

  const showConfirm = (title, message, onConfirm, options = {}) => {
    showAlert({
      title,
      message,
      type: 'warning',
      showCancel: true,
      onConfirm,
      confirmText: 'Yes',
      cancelText: 'No',
      ...options
    })
  }

  return {
    alert,
    showAlert,
    hideAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm
  }
}

export default useAlert