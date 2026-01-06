import React from 'react'
import ReactDOM from 'react-dom/client'
import axios from 'axios'
import App from './App.jsx'
import './index.css'

// Configure axios base URL
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
console.log('🔧 API URL:', apiUrl)
axios.defaults.baseURL = apiUrl

// Add request interceptor for debugging
axios.interceptors.request.use(request => {
  console.log('🚀 Making request to:', request.url, 'with baseURL:', request.baseURL)
  return request
})

// Add response interceptor for debugging
axios.interceptors.response.use(
  response => {
    console.log('✅ Response received:', response.status, response.data)
    return response
  },
  error => {
    console.error('❌ Request failed:', error.response?.status, error.response?.data || error.message)
    return Promise.reject(error)
  }
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)