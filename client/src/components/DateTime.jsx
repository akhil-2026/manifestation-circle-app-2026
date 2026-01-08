import { useState, useEffect } from 'react'
import { Clock, Calendar } from 'lucide-react'

const DateTime = ({ 
  showDate = true, 
  showTime = true, 
  showSeconds = true, 
  format = 'full',
  className = '',
  variant = 'default' 
}) => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatDate = (date) => {
    const options = {
      weekday: format === 'full' ? 'long' : 'short',
      year: 'numeric',
      month: format === 'full' ? 'long' : 'short',
      day: 'numeric'
    }
    return date.toLocaleDateString('en-US', options)
  }

  const formatTime = (date) => {
    const options = {
      hour: '2-digit',
      minute: '2-digit',
      ...(showSeconds && { second: '2-digit' }),
      hour12: true
    }
    return date.toLocaleTimeString('en-US', options)
  }

  const getGreeting = () => {
    const hour = currentDateTime.getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    if (hour < 21) return 'Good Evening'
    return 'Good Night'
  }

  if (variant === 'greeting') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="text-purple-400">
          {getGreeting() === 'Good Morning' && '🌅'}
          {getGreeting() === 'Good Afternoon' && '☀️'}
          {getGreeting() === 'Good Evening' && '🌆'}
          {getGreeting() === 'Good Night' && '🌙'}
        </div>
        <div>
          <p className="text-sm text-dark-400">{getGreeting()}</p>
          <p className="text-xs text-dark-500">{formatTime(currentDateTime)}</p>
        </div>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        {showDate && (
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-dark-300">
              {currentDateTime.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })}
            </span>
          </div>
        )}
        {showTime && (
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-dark-300">
              {formatTime(currentDateTime)}
            </span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 ${className}`}>
      {showDate && (
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 flex-shrink-0" />
          <span className="text-sm sm:text-base text-dark-300">
            {formatDate(currentDateTime)}
          </span>
        </div>
      )}
      {showTime && (
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 flex-shrink-0" />
          <span className="text-sm sm:text-base text-dark-300 font-mono">
            {formatTime(currentDateTime)}
          </span>
        </div>
      )}
    </div>
  )
}

export default DateTime