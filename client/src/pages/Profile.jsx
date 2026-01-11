import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { User, Camera, Save, X, Upload, Trash2 } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import DateTime from '../components/DateTime'
import Alert from '../components/Alert'
import useAlert from '../hooks/useAlert'
import PWAShareButton from '../components/PWAShareButton'

const Profile = () => {
  const { user, updateUser } = useAuth()
  const { alert, hideAlert, showSuccess, showError, showConfirm } = useAlert()
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    profilePicture: null,
    joinedAt: null
  })
  const [editingName, setEditingName] = useState(false)
  const [newName, setNewName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/profile')
      setProfile(response.data)
      setNewName(response.data.name)
    } catch (error) {
      console.error('Fetch profile error:', error)
      showError('Load Failed', 'Failed to load profile data')
    } finally {
      setLoading(false)
    }
  }

  const handleNameUpdate = async () => {
    if (!newName.trim()) {
      showError('Invalid Name', 'Name cannot be empty')
      return
    }

    if (newName.trim() === profile.name) {
      setEditingName(false)
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const response = await axios.put('/profile', {
        name: newName.trim()
      })

      setProfile(prev => ({ ...prev, name: response.data.user.name }))
      updateUser(response.data.user)
      setEditingName(false)
      showSuccess('Updated!', 'Name updated successfully!')
      
    } catch (error) {
      console.error('Update name error:', error)
      showError('Update Failed', error.response?.data?.message || 'Failed to update name')
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showError('Invalid File Type', 'Please select an image file (JPG, PNG, GIF)')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError('File Too Large', 'Image size must be less than 5MB')
      return
    }

    setUploading(true)
    setError('')
    setSuccess('')

    try {
      const formData = new FormData()
      formData.append('profilePicture', file)

      const response = await axios.post('/profile/upload-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      setProfile(prev => ({ 
        ...prev, 
        profilePicture: response.data.profilePicture 
      }))
      updateUser(response.data.user)
      showSuccess('Success!', 'Profile picture updated successfully!')
      
    } catch (error) {
      console.error('Upload image error:', error)
      showError('Upload Failed', error.response?.data?.message || 'Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleDeletePicture = async () => {
    if (!profile.profilePicture) return

    showConfirm(
      'Delete Profile Picture',
      'Are you sure you want to delete your profile picture? This action cannot be undone.',
      async () => {
        setSaving(true)
        setError('')
        setSuccess('')

        try {
          const response = await axios.delete('/profile/picture')
          
          setProfile(prev => ({ ...prev, profilePicture: null }))
          updateUser(response.data.user)
          showSuccess('Deleted!', 'Profile picture deleted successfully!')
          
        } catch (error) {
          console.error('Delete picture error:', error)
          showError('Delete Failed', error.response?.data?.message || 'Failed to delete picture')
        } finally {
          setSaving(false)
        }
      }
    )
  }

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2)
  }

  if (loading) {
    return <LoadingSpinner text="Loading profile..." />
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <User className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500 flex-shrink-0" />
          <h1 className="text-2xl sm:text-3xl font-bold text-white">My Profile</h1>
        </div>
        <DateTime variant="compact" showSeconds={false} />
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-900/50 border border-green-500 text-green-200 px-4 py-3 rounded-lg mb-6">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Profile Picture Section */}
      <div className="card mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Profile Picture</h2>
        
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              {profile.profilePicture ? (
                <img
                  src={profile.profilePicture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-2xl sm:text-3xl font-bold">
                  {getInitials(profile.name)}
                </span>
              )}
            </div>
            
            {uploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                <LoadingSpinner variant="inline" />
              </div>
            )}
          </div>

          {/* Upload Controls */}
          <div className="flex-1 text-center sm:text-left">
            <p className="text-dark-300 mb-4 text-sm sm:text-base">
              Upload a profile picture to personalize your account
            </p>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || saving}
                className="btn-primary flex items-center justify-center space-x-2 text-sm"
              >
                <Upload className="w-4 h-4" />
                <span>{profile.profilePicture ? 'Change Picture' : 'Upload Picture'}</span>
              </button>
              
              {profile.profilePicture && (
                <button
                  onClick={handleDeletePicture}
                  disabled={uploading || saving}
                  className="btn-secondary flex items-center justify-center space-x-2 text-sm text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            
            <p className="text-xs text-dark-500 mt-2">
              Supported formats: JPG, PNG, GIF. Max size: 5MB
            </p>
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="card">
        <h2 className="text-lg sm:text-xl font-bold text-white mb-6">Profile Information</h2>
        
        <div className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Name
            </label>
            {editingName ? (
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="input-field flex-1 text-sm sm:text-base"
                  placeholder="Enter your name"
                  maxLength={50}
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleNameUpdate}
                    disabled={saving}
                    className="btn-primary flex items-center justify-center space-x-2 text-sm"
                  >
                    {saving ? (
                      <LoadingSpinner variant="button" />
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setEditingName(false)
                      setNewName(profile.name)
                      setError('')
                    }}
                    className="btn-secondary flex items-center justify-center space-x-2 text-sm"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-white text-sm sm:text-base">{profile.name}</span>
                <button
                  onClick={() => setEditingName(true)}
                  className="text-purple-400 hover:text-purple-300 text-sm"
                >
                  Edit
                </button>
              </div>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Email
            </label>
            <div className="flex items-center justify-between">
              <span className="text-white text-sm sm:text-base">{profile.email}</span>
              <span className="text-xs text-dark-500">Cannot be changed</span>
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Role
            </label>
            <div className="flex items-center space-x-2">
              {user?.email === (import.meta.env.VITE_SUPER_ADMIN_EMAIL || 'akhilkrishna2400@gmail.com') ? (
                <>
                  <span className="text-white text-sm sm:text-base">Super Admin</span>
                  <span className="px-2 py-1 text-xs bg-red-600 text-white rounded-full">
                    Owner
                  </span>
                </>
              ) : (
                <>
                  <span className="text-white text-sm sm:text-base capitalize">{user?.role}</span>
                  {user?.role === 'admin' && (
                    <span className="px-2 py-1 text-xs bg-purple-600 text-white rounded-full">
                      Admin
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Member Since */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Member Since
            </label>
            <span className="text-white text-sm sm:text-base">
              {new Date(profile.joinedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Share App */}
      <div className="card mt-6 sm:mt-8">
        <h3 className="text-base sm:text-lg font-bold text-white mb-3">Share Manifestation Circle</h3>
        <p className="text-dark-300 text-sm mb-4">
          Invite friends to join your manifestation journey! Share the app with others who want to transform their reality through daily practice.
        </p>
        <PWAShareButton 
          text="Join me on Manifestation Circle! Transform your reality through daily manifestation practice 🌙✨"
          className="w-full sm:w-auto"
        />
      </div>

      {/* Tips */}
      <div className="card mt-6 sm:mt-8">
        <h3 className="text-base sm:text-lg font-bold text-white mb-3">Profile Tips</h3>
        <ul className="text-dark-300 space-y-2 text-sm">
          <li>• Use a clear, recent photo for your profile picture</li>
          <li>• Your name will be visible to other circle members</li>
          <li>• Profile pictures are automatically optimized and resized</li>
          <li>• You can update your information anytime</li>
          <li>• Enable notifications to get daily manifestation reminders</li>
        </ul>
      </div>

      {/* Custom Alert */}
      <Alert
        isOpen={alert.isOpen}
        onClose={hideAlert}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        confirmText={alert.confirmText}
        cancelText={alert.cancelText}
        showCancel={alert.showCancel}
        onConfirm={alert.onConfirm}
        onCancel={alert.onCancel}
        autoClose={alert.autoClose}
        autoCloseDelay={alert.autoCloseDelay}
      />
    </div>
  )
}

export default Profile