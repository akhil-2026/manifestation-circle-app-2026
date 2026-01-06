import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarData, setCalendarData] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCalendarData()
  }, [currentDate])

  const fetchCalendarData = async () => {
    setLoading(true)
    try {
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1
      const response = await axios.get(`/manifestation/calendar/${year}/${month}`)
      setCalendarData(response.data.calendar)
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <CalendarIcon className="w-8 h-8 text-purple-500" />
          <h1 className="text-3xl font-bold text-white">Manifestation Calendar</h1>
        </div>
      </div>

      {/* Calendar */}
      <div className="card">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <h2 className="text-2xl font-bold text-white">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {dayNames.map(day => (
            <div key={day} className="text-center text-dark-400 font-medium py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {renderCalendarDays()}
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-6 mt-8 pt-6 border-t border-dark-700">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-600 rounded"></div>
            <span className="text-sm text-dark-300">Completed</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-600 rounded"></div>
            <span className="text-sm text-dark-300">Missed</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-dark-800 rounded"></div>
            <span className="text-sm text-dark-300">No Data</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-dark-800 rounded ring-2 ring-purple-500"></div>
            <span className="text-sm text-dark-300">Today</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Calendar