import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { Users, Crown, Flame, Target, Edit3, Save, X } from 'lucide-react'

const GroupView = () => {
  const { user } = useAuth()
  const [groupData, setGroupData] = useState({ members: [] })
  const [thread, setThread] = useState('')
  const [editingThread, setEditingThread] = useState(false)
  const [newThreadMessage, setNewThreadMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchGroupData()
  }, [])

  const fetchGroupData = async () => {
    try {
      const [groupRes, threadRes] = await Promise.all([
        axios.get('/group/details'),
        axios.get('/group/thread')
      ])
      
      setGroupData(groupRes.data)
      setThread(threadRes.data.thread)
      setNewThreadMessage(threadRes.data.thread)
    } catch (error) {
      console.error('Group data fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateThread = async () => {
    setSaving(true)
    try {
      await axios.put('/group/thread', { message: newThreadMessage })
      setThread(newThreadMessage)
      setEditingThread(false)
    } catch (error) {
      console.error('Update thread error:', error)
      alert('Error updating thread message')
    } finally {
      setSaving(false)
    }
  }

  const cancelEdit = () => {
    setNewThreadMessage(thread)
    setEditingThread(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <Users className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500 flex-shrink-0" />
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Circle Members</h1>
        </div>
        <div className="text-dark-400 text-sm sm:text-base">
          {groupData.totalMembers}/4 members
        </div>
      </div>

      {/* Circle Message */}
      <div className="card mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
          <h2 className="text-lg sm:text-xl font-bold text-white">Circle Message</h2>
          {user?.role === 'admin' && !editingThread && (
            <button
              onClick={() => setEditingThread(true)}
              className="btn-secondary flex items-center space-x-2 text-sm w-full sm:w-auto justify-center"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit</span>
            </button>
          )}
        </div>

        {editingThread ? (
          <div className="space-y-4">
            <textarea
              value={newThreadMessage}
              onChange={(e) => setNewThreadMessage(e.target.value)}
              className="input-field w-full h-24 sm:h-32 resize-none text-sm sm:text-base"
              placeholder="Share a weekly or monthly intention with the circle..."
            />
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={updateThread}
                disabled={saving}
                className="btn-primary flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save'}</span>
              </button>
              <button
                onClick={cancelEdit}
                className="btn-secondary flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-dark-800 rounded-lg p-4 sm:p-6">
            <p className="text-dark-200 text-base sm:text-lg leading-relaxed">
              {thread || "No message from the circle yet..."}
            </p>
          </div>
        )}
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {groupData.members.map((member) => (
          <div key={member.id} className="card p-4 sm:p-6">
            <div className="text-center">
              {/* Avatar */}
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-white text-lg sm:text-xl font-bold">
                  {member.name.charAt(0).toUpperCase()}
                </span>
              </div>

              {/* Name and Role */}
              <div className="mb-3 sm:mb-4">
                <div className="flex items-center justify-center space-x-2 mb-1">
                  <h3 className="text-base sm:text-lg font-semibold text-white truncate">{member.name}</h3>
                  {member.role === 'admin' && (
                    <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs sm:text-sm text-dark-400 capitalize">{member.role}</p>
              </div>

              {/* Stats */}
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Flame className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-dark-300">Streak</span>
                  </div>
                  <span className="text-white font-semibold text-sm sm:text-base">{member.currentStreak}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-dark-300">Consistency</span>
                  </div>
                  <span className="text-white font-semibold text-sm sm:text-base">{member.consistencyPercentage}%</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3 sm:mt-4">
                <div className="w-full bg-dark-800 rounded-full h-1.5 sm:h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 sm:h-2 rounded-full transition-all duration-300"
                    style={{ width: `${member.consistencyPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Member since */}
              <p className="text-xs text-dark-500 mt-2 sm:mt-3">
                Member since {new Date(member.joinedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}

        {/* Empty slots */}
        {Array.from({ length: 4 - groupData.totalMembers }).map((_, index) => (
          <div key={`empty-${index}`} className="card border-dashed border-dark-600 p-4 sm:p-6">
            <div className="text-center py-6 sm:py-8">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-dark-600" />
              </div>
              <p className="text-dark-500 text-sm sm:text-base">Open Slot</p>
              <p className="text-xs text-dark-600 mt-1">Invite a friend</p>
            </div>
          </div>
        ))}
      </div>

      {/* Motivational Footer */}
      <div className="text-center mt-8 sm:mt-12">
        <p className="text-dark-400 italic text-sm sm:text-base">
          "Together we manifest, together we grow 🌙✨"
        </p>
      </div>
    </div>
  )
}

export default GroupView