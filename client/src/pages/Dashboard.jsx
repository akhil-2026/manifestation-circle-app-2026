import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { Moon, Calendar, Users, Flame, Target, Play, Settings } from 'lucide-react'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [todayStatus, setTodayStatus] = useState(null)
  const [thread, setThread] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, todayRes, threadRes] = await Promise.all([
        axios.get('/api/stats/streak'),
        axios.get('/api/manifestation/today'),
        axios.get('/api/group/thread')
      ])
      
      setStats(statsRes.data)
      setTodayStatus(todayRes.data)
      setThread(threadRes.data.thread)
    } catch (error) {
      console.error('Dashboard fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {user?.name} 🌙
        </h1>
        <p className="text-dark-400">
          {todayStatus?.completed 
            ? "You've completed today's manifestation! ✨" 
            : "Ready for tonight's manifestation practice?"
          }
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center space-x-3">
            <Flame className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-dark-400 text-sm">Current Streak</p>
              <p className="text-2xl font-bold text-white">{stats?.currentStreak || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <Target className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-dark-400 text-sm">Longest Streak</p>
              <p className="text-2xl font-bold text-white">{stats?.longestStreak || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <Calendar className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-dark-400 text-sm">Total Days</p>
              <p className="text-2xl font-bold text-white">{stats?.totalCompleted || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <Users className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-dark-400 text-sm">Consistency</p>
              <p className="text-2xl font-bold text-white">{stats?.consistencyPercentage || 0}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Mirror Mode Card */}
        <div className="card">
          <div className="text-center">
            <Moon className="w-16 h-16 text-purple-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Tonight's Practice</h2>
            <p className="text-dark-400 mb-6">
              {todayStatus?.completed 
                ? "You've already completed today's session"
                : "Enter mirror mode for your manifestation practice"
              }
            </p>
            <Link 
              to="/mirror" 
              className={`btn-primary inline-flex items-center space-x-2 ${
                todayStatus?.completed ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Play className="w-5 h-5" />
              <span>Start Mirror Mode</span>
            </Link>
          </div>
        </div>

        {/* Manifestation Thread */}
        <div className="card">
          <h2 className="text-xl font-bold text-white mb-4">Circle Message</h2>
          <div className="bg-dark-800 rounded-lg p-4 mb-4">
            <p className="text-dark-200 italic">
              {thread || "No message from the circle yet..."}
            </p>
          </div>
          {user?.role === 'admin' && (
            <p className="text-sm text-dark-400">
              As admin, you can update this message in the Group section
            </p>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/calendar" className="card hover:bg-dark-800 transition-colors">
          <div className="flex items-center space-x-3">
            <Calendar className="w-8 h-8 text-blue-500" />
            <div>
              <h3 className="font-semibold text-white">View Calendar</h3>
              <p className="text-dark-400 text-sm">Track your progress</p>
            </div>
          </div>
        </Link>

        <Link to="/group" className="card hover:bg-dark-800 transition-colors">
          <div className="flex items-center space-x-3">
            <Users className="w-8 h-8 text-purple-500" />
            <div>
              <h3 className="font-semibold text-white">Group View</h3>
              <p className="text-dark-400 text-sm">See everyone's progress</p>
            </div>
          </div>
        </Link>

        {user?.role === 'admin' ? (
          <Link to="/admin" className="card hover:bg-dark-800 transition-colors">
            <div className="flex items-center space-x-3">
              <Settings className="w-8 h-8 text-yellow-500" />
              <div>
                <h3 className="font-semibold text-white">Admin Panel</h3>
                <p className="text-dark-400 text-sm">Manage affirmations</p>
              </div>
            </div>
          </Link>
        ) : (
          <div className="card">
            <div className="flex items-center space-x-3">
              <Moon className="w-8 h-8 text-yellow-500" />
              <div>
                <h3 className="font-semibold text-white">Daily Quote</h3>
                <p className="text-dark-400 text-sm italic">
                  "What you repeat daily becomes your reality."
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard