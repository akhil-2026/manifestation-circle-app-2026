import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { Moon, Calendar, Users, Flame, Target, Play, Settings } from 'lucide-react'
import DateTime from '../components/DateTime'

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
        axios.get('/stats/streak'),
        axios.get('/manifestation/today'),
        axios.get('/group/thread')
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Welcome Header with DateTime */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-3 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Welcome back, {user?.name} 🌙
            </h1>
            <p className="text-dark-400 text-sm sm:text-base">
              {todayStatus?.completed 
                ? "You've completed today's manifestation! ✨" 
                : "Ready for tonight's manifestation practice?"
              }
            </p>
          </div>
          <DateTime variant="greeting" className="sm:text-right" />
        </div>
        
        {/* Current Date & Time Display */}
        <div className="bg-dark-800 rounded-lg p-3 sm:p-4 border border-dark-700">
          <DateTime 
            showDate={true} 
            showTime={true} 
            showSeconds={true}
            format="full"
            className="justify-center sm:justify-start"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <div className="card p-4 sm:p-6">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Flame className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-dark-400 text-xs sm:text-sm">Current Streak</p>
              <p className="text-lg sm:text-2xl font-bold text-white">{stats?.currentStreak || 0}</p>
            </div>
          </div>
        </div>

        <div className="card p-4 sm:p-6">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Target className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-dark-400 text-xs sm:text-sm">Longest Streak</p>
              <p className="text-lg sm:text-2xl font-bold text-white">{stats?.longestStreak || 0}</p>
            </div>
          </div>
        </div>

        <div className="card p-4 sm:p-6">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-dark-400 text-xs sm:text-sm">Total Days</p>
              <p className="text-lg sm:text-2xl font-bold text-white">{stats?.totalCompleted || 0}</p>
            </div>
          </div>
        </div>

        <div className="card p-4 sm:p-6">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-dark-400 text-xs sm:text-sm">Consistency</p>
              <p className="text-lg sm:text-2xl font-bold text-white">{stats?.consistencyPercentage || 0}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
        {/* Mirror Mode Card */}
        <div className="card">
          <div className="text-center">
            <Moon className="w-12 h-12 sm:w-16 sm:h-16 text-purple-500 mx-auto mb-4" />
            <h2 className="text-lg sm:text-xl font-bold text-white mb-2">Tonight's Practice</h2>
            <p className="text-dark-400 mb-6 text-sm sm:text-base">
              {todayStatus?.completed 
                ? "You've already completed today's session"
                : "Enter mirror mode for your manifestation practice"
              }
            </p>
            <Link 
              to="/mirror" 
              className={`btn-primary inline-flex items-center space-x-2 text-sm sm:text-base ${
                todayStatus?.completed ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Start Mirror Mode</span>
            </Link>
          </div>
        </div>

        {/* Manifestation Thread */}
        <div className="card">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Circle Message</h2>
          <div className="bg-dark-800 rounded-lg p-3 sm:p-4 mb-4">
            <p className="text-dark-200 italic text-sm sm:text-base">
              {thread || "No message from the circle yet..."}
            </p>
          </div>
          {(user?.role === 'admin' || user?.email === import.meta.env.VITE_SUPER_ADMIN_EMAIL) && (
            <p className="text-xs sm:text-sm text-dark-400">
              As admin, you can update this message in the Group section
            </p>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Link to="/calendar" className="card hover:bg-dark-800 transition-colors p-4 sm:p-6">
          <div className="flex items-center space-x-3">
            <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 flex-shrink-0" />
            <div className="min-w-0">
              <h3 className="font-semibold text-white text-sm sm:text-base">View Calendar</h3>
              <p className="text-dark-400 text-xs sm:text-sm">Track your progress</p>
            </div>
          </div>
        </Link>

        <Link to="/group" className="card hover:bg-dark-800 transition-colors p-4 sm:p-6">
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500 flex-shrink-0" />
            <div className="min-w-0">
              <h3 className="font-semibold text-white text-sm sm:text-base">Group View</h3>
              <p className="text-dark-400 text-xs sm:text-sm">See everyone's progress</p>
            </div>
          </div>
        </Link>

          {user?.role === 'admin' || user?.email === import.meta.env.VITE_SUPER_ADMIN_EMAIL ? (
          <Link to="/admin" className="card hover:bg-dark-800 transition-colors p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-3">
              <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500 flex-shrink-0" />
              <div className="min-w-0">
                <h3 className="font-semibold text-white text-sm sm:text-base">Admin Panel</h3>
                <p className="text-dark-400 text-xs sm:text-sm">Manage affirmations</p>
              </div>
            </div>
          </Link>
        ) : (
          <div className="card p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-3">
              <Moon className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500 flex-shrink-0" />
              <div className="min-w-0">
                <h3 className="font-semibold text-white text-sm sm:text-base">Daily Quote</h3>
                <p className="text-dark-400 text-xs sm:text-sm italic">
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