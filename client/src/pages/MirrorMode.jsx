import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { X, Check } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'

const MirrorMode = () => {
  const navigate = useNavigate()
  const [affirmations, setAffirmations] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState(false)

  useEffect(() => {
    fetchAffirmations()
  }, [])

  useEffect(() => {
    if (affirmations.length > 0 && currentIndex < affirmations.length) {
      const timer = setTimeout(() => {
        if (currentIndex < affirmations.length - 1) {
          setCurrentIndex(currentIndex + 1)
        } else {
          setIsComplete(true)
        }
      }, 6000) // 6 seconds per affirmation

      return () => clearTimeout(timer)
    }
  }, [currentIndex, affirmations.length])

  const fetchAffirmations = async () => {
    try {
      const response = await axios.get('/affirmations')
      setAffirmations(response.data)
    } catch (error) {
      console.error('Fetch affirmations error:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsComplete = async () => {
    setMarking(true)
    try {
      await axios.post('/manifestation/mark')
      navigate('/dashboard')
    } catch (error) {
      console.error('Mark complete error:', error)
      alert('Error marking as complete. Please try again.')
    } finally {
      setMarking(false)
    }
  }

  const exitMirrorMode = () => {
    navigate('/dashboard')
  }

  if (loading) {
    return <LoadingSpinner text="Preparing your manifestations..." />
  }

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col">
      {/* Exit Button */}
      <button
        onClick={exitMirrorMode}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-dark-800 hover:bg-dark-700 transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-dark-800">
        <div 
          className="h-full bg-purple-500 transition-all duration-1000 ease-linear"
          style={{ 
            width: `${((currentIndex + 1) / affirmations.length) * 100}%` 
          }}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-8">
        {!isComplete ? (
          <div className="text-center max-w-4xl mx-auto px-4">
            <div className="animate-fade-in">
              <p className="text-2xl sm:text-4xl md:text-6xl font-light leading-relaxed text-center px-2">
                {affirmations[currentIndex]?.text}
              </p>
            </div>
            
            {/* Affirmation Counter */}
            <div className="mt-8 sm:mt-12">
              <p className="text-dark-400 text-base sm:text-lg">
                {currentIndex + 1} of {affirmations.length}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center max-w-2xl mx-auto animate-fade-in px-4">
            <div className="mb-6 sm:mb-8">
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Check className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4">Practice Complete</h2>
              <p className="text-lg sm:text-xl text-dark-300 mb-6 sm:mb-8">
                You've finished tonight's manifestation session
              </p>
              <p className="text-base sm:text-lg text-purple-300 italic mb-6 sm:mb-8">
                "What you repeat daily becomes your reality."
              </p>
            </div>

            <button
              onClick={markAsComplete}
              disabled={marking}
              className="btn-primary text-lg sm:text-xl px-6 sm:px-8 py-3 sm:py-4 mb-4 flex items-center justify-center w-full sm:w-auto"
            >
              {marking ? (
                <LoadingSpinner variant="button" />
              ) : (
                <>
                  <Check className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                  I have completed today's manifestation
                </>
              )}
            </button>

            <div className="mt-4 sm:mt-6">
              <button
                onClick={exitMirrorMode}
                className="text-dark-400 hover:text-white transition-colors text-sm sm:text-base"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Info */}
      {!isComplete && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4">
          <p className="text-dark-500 text-xs sm:text-sm text-center">
            Relax and let the words flow through you...
          </p>
        </div>
      )}
    </div>
  )
}

export default MirrorMode