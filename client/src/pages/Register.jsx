import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Moon, User, Mail, Lock } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { register } = useAuth()

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

    const result = await register(formData.name, formData.email, formData.password)
    
    if (!result.success) {
      setError(result.error)
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950 px-4 py-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        <div className="text-center">
          <div className="flex justify-center items-center space-x-2 mb-4">
            <Moon className="w-8 h-8 sm:w-10 sm:h-10 text-purple-500 flex-shrink-0" />
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Join the Circle</h1>
          </div>
          <p className="text-dark-400 text-sm sm:text-base">Start your manifestation journey with us</p>
          <p className="text-xs sm:text-sm text-purple-300 mt-2">
            ✨ Registration is by invitation only for our private circle
          </p>
        </div>

        <div className="card p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {error && (
              <div className="bg-red-900/50 border border-red-500 text-red-200 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-dark-400" />
                <input
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field pl-9 sm:pl-10 w-full text-sm sm:text-base"
                  placeholder="Your name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-dark-400" />
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field pl-9 sm:pl-10 w-full text-sm sm:text-base"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-dark-400" />
                <input
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pl-9 sm:pl-10 w-full text-sm sm:text-base"
                  placeholder="At least 6 characters"
                />
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
                'Join Circle'
              )}
            </button>
          </form>

          <div className="mt-4 sm:mt-6 text-center">
            <p className="text-dark-400 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register