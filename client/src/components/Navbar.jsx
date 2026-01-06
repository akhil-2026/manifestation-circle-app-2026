import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Home, Calendar, Users, LogOut, Moon, Settings } from 'lucide-react'

const Navbar = () => {
  const { user, logout } = useAuth()
  const location = useLocation()

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/calendar', icon: Calendar, label: 'Calendar' },
    { path: '/group', icon: Users, label: 'Group' }
  ]

  // Add admin link for admin users
  if (user?.role === 'admin') {
    navItems.push({ path: '/admin', icon: Settings, label: 'Admin' })
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="bg-dark-900 border-b border-dark-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Moon className="w-6 h-6 text-purple-500" />
            <span className="text-xl font-bold text-white">Manifestation Circle</span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
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

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-dark-300">
              Welcome, {user?.name}
            </span>
            {user?.role === 'admin' && (
              <span className="px-2 py-1 text-xs bg-purple-600 text-white rounded-full">
                Admin
              </span>
            )}
            <button
              onClick={logout}
              className="flex items-center space-x-2 text-dark-300 hover:text-white transition-colors duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <div className="flex space-x-1">
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
        </div>
      </div>
    </nav>
  )
}

export default Navbar