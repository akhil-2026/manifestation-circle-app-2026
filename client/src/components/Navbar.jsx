import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Home, Calendar, Users, LogOut, Moon, Settings, Menu, X, Smartphone, Shield } from 'lucide-react'
import DateTime from '../components/DateTime'
import { usePWA } from '../hooks/usePWA'

const Navbar = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [hasSuperAdminAccess, setHasSuperAdminAccess] = useState(false)
  const { isInstalled, isOnline } = usePWA()

  // Check if user has super admin access
  useEffect(() => {
    const checkSuperAdminAccess = async () => {
      if (!user) {
        setHasSuperAdminAccess(false)
        return
      }

      try {
        const token = localStorage.getItem('token')
        console.log('🔍 Checking Super Admin access for:', user.email)
        console.log('🔍 API URL:', import.meta.env.VITE_API_URL)
        
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/super-admin/check-access`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        console.log('🔍 Response status:', response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log('🔍 Response data:', data)
          setHasSuperAdminAccess(data.hasAccess)
          
          // Show debug info if available
          if (data.debug) {
            console.log('🔍 Debug Info:', data.debug)
          }
        } else {
          console.log('🔍 Response not ok:', await response.text())
          setHasSuperAdminAccess(false)
        }
      } catch (error) {
        console.error('🔍 Super Admin check error:', error)
        setHasSuperAdminAccess(false)
      }
    }

    checkSuperAdminAccess()
  }, [user])

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/calendar', icon: Calendar, label: 'Calendar' },
    { path: '/group', icon: Users, label: 'Group' }
  ]

  // Add admin link for admin users
  if (user?.role === 'admin') {
    navItems.push({ path: '/admin', icon: Settings, label: 'Admin' })
  }

  // Add super admin link for super admin user (completely hidden from others)
  if (hasSuperAdminAccess) {
    navItems.push({ path: '/super-admin', icon: Shield, label: 'Super Admin' })
  }

  const isActive = (path) => location.pathname === path

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  return (
    <nav className="bg-dark-900 border-b border-dark-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Moon className="w-6 h-6 text-purple-500" />
            <span className="text-lg sm:text-xl font-bold text-white truncate">
              <span className="hidden sm:inline">Manifestation Circle</span>
              <span className="sm:hidden">Manifestation</span>
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActive(path)
                    ? 'bg-purple-600 text-white'
                    : 'text-dark-300 hover:text-white hover:bg-dark-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Link>
            ))}
          </div>

          {/* Desktop DateTime & User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <DateTime variant="compact" showSeconds={false} />
            
            {/* PWA Status Indicator */}
            {isInstalled && (
              <div className="flex items-center space-x-1 text-xs">
                <Smartphone className="w-3 h-3 text-green-400" />
                <span className="text-green-400">PWA</span>
              </div>
            )}
            
            {/* Online/Offline Status */}
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-orange-400'}`} 
                 title={isOnline ? 'Online' : 'Offline'} />
            
            <div className="h-6 w-px bg-dark-600"></div>
            <span className="text-sm text-dark-300 truncate max-w-32">
              {user?.name}
            </span>
            {user?.role === 'admin' && (
              <span className="px-2 py-1 text-xs bg-purple-600 text-white rounded-full">
                Admin
              </span>
            )}
            {/* Temporary debug info */}
            {user?.email === 'akhilkrishna2400@gmail.com' && (
              <span className="px-2 py-1 text-xs bg-yellow-600 text-white rounded-full">
                SA: {hasSuperAdminAccess ? 'YES' : 'NO'}
              </span>
            )}
            <Link
              to="/profile"
              className="text-dark-300 hover:text-white transition-colors duration-200 text-sm"
            >
              Profile
            </Link>
            <button
              onClick={logout}
              className="flex items-center space-x-2 text-dark-300 hover:text-white transition-colors duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {user?.role === 'admin' && (
              <span className="px-2 py-1 text-xs bg-purple-600 text-white rounded-full">
                Admin
              </span>
            )}
            <button
              onClick={handleMobileMenuToggle}
              className="text-dark-300 hover:text-white p-2"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-dark-700 mt-4 pt-4">
            {/* DateTime Display */}
            <div className="px-2 mb-4">
              <DateTime variant="compact" showSeconds={false} className="justify-center" />
            </div>
            
            {/* User Info */}
            <div className="flex items-center justify-between mb-4 px-2">
              <span className="text-sm text-dark-300">
                Welcome, {user?.name}
              </span>
              <div className="flex items-center space-x-3">
                <Link
                  to="/profile"
                  onClick={closeMobileMenu}
                  className="text-dark-300 hover:text-white transition-colors duration-200 text-sm"
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    logout()
                    closeMobileMenu()
                  }}
                  className="flex items-center space-x-2 text-dark-300 hover:text-white transition-colors duration-200 px-2 py-1"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
            
            {/* Navigation Links */}
            <div className="space-y-2">
              {navItems.map(({ path, icon: Icon, label }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={closeMobileMenu}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium transition-colors duration-200 ${
                    isActive(path)
                      ? 'bg-purple-600 text-white'
                      : 'text-dark-300 hover:text-white hover:bg-dark-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar