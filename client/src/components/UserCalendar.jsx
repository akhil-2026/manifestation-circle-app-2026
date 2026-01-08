import { useState, useEffect } from 'react'
import axios from 'axios'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, User, ArrowLeft } from 'lucide-react'
import DateTime from './DateTime'

const UserCalendar = ({ userId, userName, onBack }) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarData, setCalendarData] = useState({})
  const [userInfo, setUserInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCalendarData()
  }, [currentDate, userId])

  const fetchCalendarData = async () => {
    setLoading(true)
    try {
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1
      const response = await axios.get(`/manifestation/calendar/${userId}/${year}/${month}`)
      setCalendarData(response.data.calendar)
      setUserInfo(response.data.user)
    } catch (error) {
      console.error('Calendar fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(currentDate.getMonth() + direction)
    setCurrentDate(newDate)
  }

  const isToday = (day) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    )
  }

  const isFuture = (day) => {
    const today = new Date()
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    return checkDate > today
  }

  const getDayStatus = (day) => {
    return calendarData[day]?.status || null
  }

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const status = getDayStatus(day)
      const future = isFuture(day)
      const today = isToday(day)

      let dayClass = 'calendar-day '
      
      if (future) {
        dayClass += 'calendar-day-future'
      } else if (status === 'done') {
        dayClass += 'calendar-day-done'
      } else if (status === 'missed') {
        dayClass += 'calendar-day-missed'
      } else {
        dayClass += 'bg-dark-800 text-dark-300 hover:bg-dark-700'
      }

      if (today) {
        dayClass += ' calendar-day-today'
      }

      days.push(
        <div key={day} className={dayClass}>
          {day}
        </div>
      )
    }

    return days
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2) || '?'
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Header */}
      <div className="flex flex-col space-y-4 mb-6 sm:mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-purple-400 hover:text-purple-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Group</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            {/* User Avatar */}
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              {userInfo?.profilePicture ? (
                <img
                  src={userInfo.profilePicture}
                  alt={`${userInfo.name}'s profile`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-lg font-bold">
                  {getInitials(userInfo?.name || userName)}
                </span>
              )}
            </div>
            
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                {userInfo?.name || userName}'s Calendar
              </h1>
              <p className="text-dark-400 text-sm sm:text-base">
                View their manifestation journey
              </p>
            </div>
          </div>
          <DateTime variant="compact" showSeconds={false} />
        </div>
      </div>

      {/* Calendar */}
      <div className="card p-4 sm:p-6">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          
          <h2 className="text-lg sm:text-2xl font-bold text-white text-center">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 sm:mb-4">
          {dayNames.map(day => (
            <div key={day} className="text-center text-dark-400 font-medium py-1 sm:py-2 text-xs sm:text-sm">
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day.slice(0, 1)}</span>
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        {loading ? (
          <div className="flex justify-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {renderCalendarDays()}
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-6 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-dark-700">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-600 rounded"></div>
            <span className="text-xs sm:text-sm text-dark-300">Completed</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-600 rounded"></div>
            <span className="text-xs sm:text-sm text-dark-300">Missed</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-dark-800 rounded"></div>
            <span className="text-xs sm:text-sm text-dark-300">No Data</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-dark-800 rounded ring-2 ring-purple-500"></div>
            <span className="text-xs sm:text-sm text-dark-300">Today</span>
          </div>
        </div>
      </div>

      {/* Motivational Message */}
      <div className="text-center mt-6 sm:mt-8">
        <p className="text-dark-400 italic text-sm sm:text-base">
          "Supporting each other's manifestation journey 🌙✨"
        </p>
      </div>
    </div>
  )
}

export default UserCalendar