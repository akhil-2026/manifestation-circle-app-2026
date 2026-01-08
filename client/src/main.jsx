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

// Register Service Worker for PWA functionality
if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })
      
      console.log('🎯 PWA: Service Worker registered successfully', registration.scope)
      
      // Handle service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        console.log('🔄 PWA: New service worker installing...')
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('✨ PWA: New content available, please refresh!')
            // You could show a notification to the user here
          }
        })
      })
      
    } catch (error) {
      console.error('❌ PWA: Service Worker registration failed:', error)
    }
  })
  
  // Handle service worker messages
  if (typeof navigator !== 'undefined' && navigator.serviceWorker) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      console.log('📨 PWA: Message from service worker:', event.data)
    })
  }
}