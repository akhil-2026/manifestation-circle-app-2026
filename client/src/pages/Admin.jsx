import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { Settings, Plus, Edit3, Save, X, GripVertical, ChevronUp, ChevronDown } from 'lucide-react'
import DateTime from '../components/DateTime'
import Alert from '../components/Alert'
import useAlert from '../hooks/useAlert'

const Admin = () => {
  const { user } = useAuth()
  const { alert, showAlert, hideAlert, showSuccess, showError } = useAlert()
  const [affirmations, setAffirmations] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')
  const [newAffirmation, setNewAffirmation] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    if (user?.role !== 'admin') {
      return
    }
    fetchAffirmations()
  }, [user])

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

  const startEdit = (affirmation) => {
    setEditingId(affirmation._id)
    setEditText(affirmation.text)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditText('')
  }

  const saveEdit = async (id) => {
    if (!editText.trim()) return

    setSaving(true)
    try {
      const response = await axios.put(`/api/affirmations/${id}`, {
        text: editText.trim()
      })
      
      setAffirmations(affirmations.map(aff => 
        aff._id === id ? response.data : aff
      ))
      setEditingId(null)
      setEditText('')
    } catch (error) {
      console.error('Update affirmation error:', error)
      showError('Update Failed', 'Error updating affirmation')
    } finally {
      setSaving(false)
    }
  }

  const addAffirmation = async () => {
    if (!newAffirmation.trim()) return

    setSaving(true)
    try {
      const maxOrder = Math.max(...affirmations.map(a => a.order), 0)
      const response = await axios.post('/affirmations', {
        text: newAffirmation.trim(),
        order: maxOrder + 1
      })
      
      setAffirmations([...affirmations, response.data])
      setNewAffirmation('')
      setShowAddForm(false)
      showSuccess('Added!', 'Affirmation added successfully!')
    } catch (error) {
      console.error('Add affirmation error:', error)
      showError('Add Failed', 'Error adding affirmation')
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (id, isActive) => {
    setSaving(true)
    try {
      const response = await axios.put(`/api/affirmations/${id}`, {
        isActive: !isActive
      })
      
      setAffirmations(affirmations.map(aff => 
        aff._id === id ? response.data : aff
      ))
    } catch (error) {
      console.error('Toggle affirmation error:', error)
      showError('Update Failed', 'Error updating affirmation status')
    } finally {
      setSaving(false)
    }
  }

  const moveAffirmation = async (id, direction) => {
    const currentIndex = affirmations.findIndex(a => a._id === id)
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === affirmations.length - 1)
    ) {
      return
    }

    setSaving(true)
    
    try {
      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
      const currentAff = affirmations[currentIndex]
      const targetAff = affirmations[targetIndex]
      
      // Call the reorder endpoint
      await axios.put('/affirmations/reorder', {
        affirmation1Id: currentAff._id,
        affirmation2Id: targetAff._id
      })
      
      // Update local state
      const newAffirmations = [...affirmations]
      
      // Swap their order values
      const tempOrder = currentAff.order
      currentAff.order = targetAff.order
      targetAff.order = tempOrder
      
      // Swap positions in array
      newAffirmations[currentIndex] = targetAff
      newAffirmations[targetIndex] = currentAff
      
      setAffirmations(newAffirmations)
      
    } catch (error) {
      console.error('Reorder error:', error)
      showError('Reorder Failed', `Error reordering affirmations: ${error.response?.data?.message || error.message}`)
      // Revert on error
      fetchAffirmations()
    } finally {
      setSaving(false)
    }
  }

  if (user?.role !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-dark-400">Only admins can access this page.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Header */}
      <div className="flex flex-col space-y-4 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500 flex-shrink-0" />
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Admin Panel</h1>
            {saving && (
              <div className="flex items-center space-x-2 text-purple-400">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400"></div>
                <span className="text-sm">Saving...</span>
              </div>
            )}
          </div>
          <DateTime variant="compact" showSeconds={false} />
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          disabled={saving}
          className="btn-primary flex items-center space-x-2 text-sm sm:text-base w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          <span>Add Affirmation</span>
        </button>
      </div>

      {/* Add New Affirmation Form */}
      {showAddForm && (
        <div className="card mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Add New Affirmation</h2>
          <div className="space-y-4">
            <textarea
              value={newAffirmation}
              onChange={(e) => setNewAffirmation(e.target.value)}
              className="input-field w-full h-20 sm:h-24 resize-none text-sm sm:text-base"
              placeholder="Enter new affirmation..."
              maxLength={200}
            />
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={addAffirmation}
                disabled={saving || !newAffirmation.trim()}
                className="btn-primary flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Adding...' : 'Add Affirmation'}</span>
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false)
                  setNewAffirmation('')
                }}
                className="btn-secondary flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Affirmations List */}
      <div className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-white mb-4">
          Manage Affirmations ({affirmations.length})
        </h2>
        
        {affirmations.map((affirmation, index) => (
          <div key={affirmation._id} className="card p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4">
              {/* Order Controls - Mobile: Horizontal, Desktop: Vertical */}
              <div className="flex sm:flex-col space-x-2 sm:space-x-0 sm:space-y-1 sm:pt-2 w-full sm:w-auto justify-center sm:justify-start">
                <button
                  onClick={() => moveAffirmation(affirmation._id, 'up')}
                  disabled={index === 0 || saving}
                  className="p-2 rounded bg-dark-800 hover:bg-dark-700 text-dark-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Move up"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <div className="flex items-center justify-center">
                  <GripVertical className="w-4 h-4 text-dark-500" />
                </div>
                <button
                  onClick={() => moveAffirmation(affirmation._id, 'down')}
                  disabled={index === affirmations.length - 1 || saving}
                  className="p-2 rounded bg-dark-800 hover:bg-dark-700 text-dark-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Move down"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* Order Number */}
              <div className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm mx-auto sm:mx-0">
                {affirmation.order}
              </div>

              {/* Content */}
              <div className="flex-1 w-full">
                {editingId === affirmation._id ? (
                  <div className="space-y-3">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="input-field w-full h-16 sm:h-20 resize-none text-sm sm:text-base"
                      maxLength={200}
                    />
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                      <button
                        onClick={() => saveEdit(affirmation._id)}
                        disabled={saving}
                        className="btn-primary flex items-center justify-center space-x-2 text-sm"
                      >
                        <Save className="w-3 h-3" />
                        <span>{saving ? 'Saving...' : 'Save'}</span>
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="btn-secondary flex items-center justify-center space-x-2 text-sm"
                      >
                        <X className="w-3 h-3" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className={`text-base sm:text-lg leading-relaxed ${affirmation.isActive ? 'text-white' : 'text-dark-400'}`}>
                      {affirmation.text}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-3">
                      <button
                        onClick={() => startEdit(affirmation)}
                        className="text-blue-400 hover:text-blue-300 flex items-center space-x-1 text-sm"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => toggleActive(affirmation._id, affirmation.isActive)}
                        className={`flex items-center space-x-1 text-sm ${
                          affirmation.isActive 
                            ? 'text-red-400 hover:text-red-300' 
                            : 'text-green-400 hover:text-green-300'
                        }`}
                      >
                        <span>{affirmation.isActive ? 'Deactivate' : 'Activate'}</span>
                      </button>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        affirmation.isActive 
                          ? 'bg-green-900 text-green-300' 
                          : 'bg-red-900 text-red-300'
                      }`}>
                        {affirmation.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="card mt-6 sm:mt-8">
        <h3 className="text-base sm:text-lg font-bold text-white mb-3">Instructions</h3>
        <ul className="text-dark-300 space-y-2 text-sm">
          <li>• Use the arrows to reorder affirmations</li>
          <li>• Click "Edit" to modify affirmation text</li>
          <li>• Toggle "Active/Inactive" to show/hide in Mirror Mode</li>
          <li>• Only active affirmations appear during manifestation sessions</li>
          <li>• Changes take effect immediately for all users</li>
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

export default Admin