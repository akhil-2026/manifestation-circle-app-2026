import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Moon, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { login } = useAuth()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await login(formData.email, formData.password)
    
    if (!result.success) {
      setError(result.error)
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950 px-4 py-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center items-center space-x-2 mb-4">
            <Moon className="w-8 h-8 sm:w-10 sm:h-10 text-purple-500 flex-shrink-0" />
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Manifestation Circle</h1>
          </div>
          <p className="text-dark-400 text-sm sm:text-base">Welcome back to your manifestation journey</p>
        </div>

        {/* Login Form */}
        <div className="card p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {error && (
              <div className="bg-red-900/50 border border-red-500 text-red-200 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-dark-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-dark-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field pl-9 sm:pl-10 w-full text-sm sm:text-base"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-dark-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-dark-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pl-9 sm:pl-10 pr-9 sm:pr-10 w-full text-sm sm:text-base"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dark-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center text-sm sm:text-base py-2.5 sm:py-3"
            >
              {loading ? (
                <LoadingSpinner variant="button" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-4 sm:mt-6 text-center">
            <p className="text-dark-400 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-purple-400 hover:text-purple-300 font-medium">
                Join the circle
              </Link>
            </p>
            <p className="text-xs text-dark-500 mt-2">
              Registration is by invitation only
            </p>
          </div>
        </div>

        {/* Quote */}
        <div className="text-center">
          <p className="text-dark-500 italic text-xs sm:text-sm">
            "What you repeat daily becomes your reality."
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login