import React, { useState, useEffect } from 'react'
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
        axios.get('/api/group/details'),
        axios.get('/api/group/thread')
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
      await axios.put('/api/group/thread', { message: newThreadMessage })
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <Users className="w-8 h-8 text-purple-500" />
          <h1 className="text-3xl font-bold text-white">Circle Members</h1>
        </div>
        <div className="text-dark-400">
          {groupData.totalMembers}/4 members
        </div>
      </div>

      {/* Circle Message */}
      <div className="card mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Circle Message</h2>
          {user?.role === 'admin' && !editingThread && (
            <button
              onClick={() => setEditingThread(true)}
              className="btn-secondary flex items-center space-x-2"
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
              className="input-field w-full h-32 resize-none"
              placeholder="Share a weekly or monthly intention with the circle..."
            />
            <div className="flex space-x-3">
              <button
                onClick={updateThread}
                disabled={saving}
                className="btn-primary flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save'}</span>
              </button>
              <button
                onClick={cancelEdit}
                className="btn-secondary flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-dark-800 rounded-lg p-6">
            <p className="text-dark-200 text-lg leading-relaxed">
              {thread || "No message from the circle yet..."}
            </p>
          </div>
        )}
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {groupData.members.map((member) => (
          <div key={member.id} className="card">
            <div className="text-center">
              {/* Avatar */}
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-xl font-bold">
                  {member.name.charAt(0).toUpperCase()}
                </span>
              </div>

              {/* Name and Role */}
              <div className="mb-4">
                <div className="flex items-center justify-center space-x-2 mb-1">
                  <h3 className="text-lg font-semibold text-white">{member.name}</h3>
                  {member.role === 'admin' && (
                    <Crown className="w-4 h-4 text-yellow-500" />
                  )}
                </div>
                <p className="text-sm text-dark-400 capitalize">{member.role}</p>
              </div>

              {/* Stats */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-dark-300">Streak</span>
                  </div>
                  <span className="text-white font-semibold">{member.currentStreak}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-dark-300">Consistency</span>
                  </div>
                  <span className="text-white font-semibold">{member.consistencyPercentage}%</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="w-full bg-dark-800 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${member.consistencyPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Member since */}
              <p className="text-xs text-dark-500 mt-3">
                Member since {new Date(member.joinedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}

        {/* Empty slots */}
        {Array.from({ length: 4 - groupData.totalMembers }).map((_, index) => (
          <div key={`empty-${index}`} className="card border-dashed border-dark-600">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-dark-600" />
              </div>
              <p className="text-dark-500">Open Slot</p>
              <p className="text-xs text-dark-600 mt-1">Invite a friend</p>
            </div>
          </div>
        ))}
      </div>

      {/* Motivational Footer */}
      <div className="text-center mt-12">
        <p className="text-dark-400 italic">
          "Together we manifest, together we grow 🌙✨"
        </p>
      </div>
    </div>
  )
}

export default GroupView