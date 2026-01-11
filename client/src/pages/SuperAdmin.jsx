import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { 
  Shield, 
  Users, 
  UserCheck, 
  UserX, 
  Crown, 
  Calendar,
  BarChart3,
  Settings,
  Trash2,
  Edit3,
  Save,
  X,
  Plus,
  Search,
  CalendarDays
} from 'lucide-react'
import DateTime from '../components/DateTime'
import Alert from '../components/Alert'
import useAlert from '../hooks/useAlert'

const SuperAdmin = () => {
  const { user } = useAuth()
  const { alert, hideAlert, showSuccess, showError, showConfirm } = useAlert()
  
  // State
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dashboardStats, setDashboardStats] = useState({})
  const [users, setUsers] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [editingUser, setEditingUser] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [editingCalendar, setEditingCalendar] = useState(null)
  const [calendarForm, setCalendarForm] = useState({})
  const [showCreateUser, setShowCreateUser] = useState(false)
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  })
  
  // Admin Override State
  const [editingAdminOverride, setEditingAdminOverride] = useState(null)
  const [adminOverrideForm, setAdminOverrideForm] = useState({
    joinedAt: '',
    currentStreak: 0,
    longestStreak: 0
  })
  const [editingAdminCalendar, setEditingAdminCalendar] = useState(null)
  const [adminCalendarEntries, setAdminCalendarEntries] = useState([])
  const [newCalendarEntry, setNewCalendarEntry] = useState({
    date: '',
    status: 'done'
  })

  useEffect(() => {
    fetchDashboardData()
    fetchUsers()
  }, [currentPage, searchTerm, roleFilter, statusFilter])

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/super-admin/dashboard')
      setDashboardStats(response.data.stats)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/super-admin/users', {
        params: {
          page: currentPage,
          search: searchTerm,
          role: roleFilter,
          status: statusFilter
        }
      })
      setUsers(response.data.users)
      setTotalPages(response.data.totalPages)
    } catch (error) {
      console.error('Error fetching users:', error)
      showError('Error', 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async () => {
    if (!createForm.name || !createForm.email || !createForm.password) {
      showError('Validation Error', 'All fields are required')
      return
    }

    setSaving(true)
    try {
      await axios.post('/super-admin/users', createForm)
      showSuccess('Success', 'User created successfully')
      setShowCreateUser(false)
      setCreateForm({ name: '', email: '', password: '', role: 'user' })
      fetchUsers()
      fetchDashboardData()
    } catch (error) {
      showError('Error', error.response?.data?.message || 'Failed to create user')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateUser = async (userId) => {
    setSaving(true)
    try {
      await axios.put(`/super-admin/users/${userId}`, editForm)
      showSuccess('Success', 'User updated successfully')
      setEditingUser(null)
      setEditForm({})
      fetchUsers()
    } catch (error) {
      showError('Error', error.response?.data?.message || 'Failed to update user')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleUserStatus = async (userId, currentStatus) => {
    const action = currentStatus ? 'block' : 'unblock'
    
    showConfirm(
      `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
      `Are you sure you want to ${action} this user?`,
      async () => {
        setSaving(true)
        try {
          await axios.patch(`/super-admin/users/${userId}/status`, {
            isActive: !currentStatus
          })
          showSuccess('Success', `User ${action}ed successfully`)
          fetchUsers()
          fetchDashboardData()
        } catch (error) {
          showError('Error', error.response?.data?.message || `Failed to ${action} user`)
        } finally {
          setSaving(false)
        }
      }
    )
  }

  const handleChangeRole = async (userId, newRole) => {
    const action = newRole === 'admin' ? 'promote to admin' : 'demote to user'
    
    showConfirm(
      'Change Role',
      `Are you sure you want to ${action}?`,
      async () => {
        setSaving(true)
        try {
          await axios.patch(`/super-admin/users/${userId}/role`, { role: newRole })
          showSuccess('Success', `User role updated successfully`)
          fetchUsers()
          fetchDashboardData()
        } catch (error) {
          showError('Error', error.response?.data?.message || 'Failed to update role')
        } finally {
          setSaving(false)
        }
      }
    )
  }

  const handleEditCalendar = async (userId) => {
    try {
      const response = await axios.get(`/super-admin/users/${userId}/details`)
      const userData = response.data
      
      setEditingCalendar(userId)
      setCalendarForm({
        currentStreak: userData.currentStreak || 0,
        longestStreak: userData.longestStreak || 0,
        calendarData: userData.calendarData || {}
      })
    } catch (error) {
      showError('Error', 'Failed to load calendar data')
    }
  }

  const handleUpdateCalendar = async (userId) => {
    setSaving(true)
    try {
      await axios.patch(`/super-admin/users/${userId}/calendar`, calendarForm)
      showSuccess('Success', 'Calendar data updated successfully')
      setEditingCalendar(null)
      setCalendarForm({})
      fetchUsers()
    } catch (error) {
      showError('Error', error.response?.data?.message || 'Failed to update calendar')
    } finally {
      setSaving(false)
    }
  }

  const cancelCalendarEdit = () => {
    setEditingCalendar(null)
    setCalendarForm({})
  }

  const handleDeleteUser = (userId, userName) => {
    showConfirm(
      'Delete User',
      `Are you sure you want to permanently delete ${userName}? This will remove all their data and cannot be undone.`,
      async () => {
        setSaving(true)
        try {
          await axios.delete(`/super-admin/users/${userId}`)
          showSuccess('Success', 'User deleted successfully')
          fetchUsers()
          fetchDashboardData()
        } catch (error) {
          showError('Error', error.response?.data?.message || 'Failed to delete user')
        } finally {
          setSaving(false)
        }
      }
    )
  }

  // Admin Override Functions
  const handleEditAdminOverride = async (userId) => {
    try {
      const response = await axios.get(`/super-admin/users/${userId}/details`)
      const userData = response.data
      
      setEditingAdminOverride(userId)
      setAdminOverrideForm({
        joinedAt: userData.user.joinedAt ? new Date(userData.user.joinedAt).toISOString().split('T')[0] : '',
        currentStreak: userData.user.currentStreak || 0,
        longestStreak: userData.user.longestStreak || 0
      })
    } catch (error) {
      showError('Error', 'Failed to load admin data')
    }
  }

  const handleUpdateAdminJoiningDate = async (userId) => {
    setSaving(true)
    try {
      await axios.patch(`/super-admin/users/${userId}/joining-date`, {
        joinedAt: adminOverrideForm.joinedAt
      })
      showSuccess('Success', 'Joining date updated successfully')
      fetchUsers()
    } catch (error) {
      showError('Error', error.response?.data?.message || 'Failed to update joining date')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateAdminStreak = async (userId) => {
    setSaving(true)
    try {
      await axios.patch(`/super-admin/users/${userId}/streak`, {
        currentStreak: adminOverrideForm.currentStreak,
        longestStreak: adminOverrideForm.longestStreak
      })
      showSuccess('Success', 'Streak data updated successfully')
      fetchUsers()
    } catch (error) {
      showError('Error', error.response?.data?.message || 'Failed to update streak')
    } finally {
      setSaving(false)
    }
  }

  const handleEditAdminCalendar = async (userId) => {
    try {
      const response = await axios.get(`/super-admin/users/${userId}/details`)
      const userData = response.data
      
      setEditingAdminCalendar(userId)
      setAdminCalendarEntries(userData.manifestationLogs || [])
      setNewCalendarEntry({
        date: new Date().toISOString().split('T')[0],
        status: 'done'
      })
    } catch (error) {
      showError('Error', 'Failed to load calendar data')
    }
  }

  const handleUpdateCalendarEntry = async (userId, date, status) => {
    setSaving(true)
    try {
      await axios.patch(`/super-admin/users/${userId}/calendar-entry`, {
        date,
        status,
        completedAt: status === 'done' ? new Date() : null
      })
      showSuccess('Success', 'Calendar entry updated successfully')
      
      // Refresh calendar data
      const response = await axios.get(`/super-admin/users/${userId}/details`)
      setAdminCalendarEntries(response.data.manifestationLogs || [])
      fetchUsers()
    } catch (error) {
      showError('Error', error.response?.data?.message || 'Failed to update calendar entry')
    } finally {
      setSaving(false)
    }
  }

  const handleAddCalendarEntry = async (userId) => {
    if (!newCalendarEntry.date) {
      showError('Error', 'Please select a date')
      return
    }

    setSaving(true)
    try {
      await axios.patch(`/super-admin/users/${userId}/calendar-entry`, {
        date: newCalendarEntry.date,
        status: newCalendarEntry.status,
        completedAt: newCalendarEntry.status === 'done' ? new Date() : null
      })
      showSuccess('Success', 'Calendar entry added successfully')
      
      // Refresh calendar data
      const response = await axios.get(`/super-admin/users/${userId}/details`)
      setAdminCalendarEntries(response.data.manifestationLogs || [])
      setNewCalendarEntry({
        date: new Date().toISOString().split('T')[0],
        status: 'done'
      })
      fetchUsers()
    } catch (error) {
      showError('Error', error.response?.data?.message || 'Failed to add calendar entry')
    } finally {
      setSaving(false)
    }
  }

  // Test Notification Function
  const handleTestNotification = async (targetEmail) => {
    if (!targetEmail) {
      showError('Error', 'Please provide a target email')
      return
    }

    setSaving(true)
    try {
      await axios.post('/super-admin/test-notification', {
        targetEmail: targetEmail,
        title: '🧪 Test Notification',
        message: 'This is a test notification from Super Admin to verify the real-time notification system is working correctly.',
        type: 'info'
      })
      showSuccess('Success', `Test notification sent to ${targetEmail}`)
    } catch (error) {
      console.error('Error sending test notification:', error)
      showError('Error', 'Failed to send test notification')
    } finally {
      setSaving(false)
    }
  }

  const cancelAdminOverride = () => {
    setEditingAdminOverride(null)
    setAdminOverrideForm({
      joinedAt: '',
      currentStreak: 0,
      longestStreak: 0
    })
  }

  const cancelAdminCalendar = () => {
    setEditingAdminCalendar(null)
    setAdminCalendarEntries([])
    setNewCalendarEntry({
      date: '',
      status: 'done'
    })
  }

  const startEdit = (user) => {
    setEditingUser(user._id)
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role
    })
  }

  const cancelEdit = () => {
    setEditingUser(null)
    setEditForm({})
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Header */}
      <div className="flex flex-col space-y-4 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-red-500" />
            <h1 className="text-3xl font-bold text-white">Super Admin Panel</h1>
            {saving && (
              <div className="flex items-center space-x-2 text-yellow-400">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400"></div>
                <span className="text-sm">Processing...</span>
              </div>
            )}
          </div>
          <DateTime variant="compact" showSeconds={false} />
        </div>
        
        {/* Warning Banner */}
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-red-400" />
            <span className="text-red-300 font-medium">
              FULL SYSTEM CONTROL - Can modify all users and admins including calendar/streak data
            </span>
          </div>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="card p-4 text-center">
          <Users className="w-6 h-6 text-blue-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{dashboardStats.totalUsers || 0}</div>
          <div className="text-sm text-dark-400">Total Users</div>
        </div>
        <div className="card p-4 text-center">
          <Crown className="w-6 h-6 text-purple-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{dashboardStats.totalAdmins || 0}</div>
          <div className="text-sm text-dark-400">Admins</div>
        </div>
        <div className="card p-4 text-center">
          <UserCheck className="w-6 h-6 text-green-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{dashboardStats.activeUsers || 0}</div>
          <div className="text-sm text-dark-400">Active</div>
        </div>
        <div className="card p-4 text-center">
          <UserX className="w-6 h-6 text-red-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{dashboardStats.blockedUsers || 0}</div>
          <div className="text-sm text-dark-400">Blocked</div>
        </div>
        <div className="card p-4 text-center">
          <Calendar className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{dashboardStats.totalManifestations || 0}</div>
          <div className="text-sm text-dark-400">Manifestations</div>
        </div>
        <div className="card p-4 text-center">
          <BarChart3 className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{dashboardStats.totalAffirmations || 0}</div>
          <div className="text-sm text-dark-400">Affirmations</div>
        </div>
      </div>

      {/* Test Notification Section */}
      <div className="card p-6 mb-8">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <span>🧪</span>
          <span>Test Real-Time Notifications</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.filter(u => u.role === 'admin').slice(0, 6).map(admin => (
            <div key={admin._id} className="bg-dark-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium truncate">{admin.name}</span>
                <Crown className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-sm text-dark-400 mb-3 truncate">{admin.email}</div>
              <button
                onClick={() => handleTestNotification(admin.email)}
                disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-3 py-2 rounded-md text-sm transition-colors"
              >
                Send Test Notification
              </button>
            </div>
          ))}
          {users.filter(u => u.role === 'user').slice(0, 3).map(user => (
            <div key={user._id} className="bg-dark-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium truncate">{user.name}</span>
                <Users className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-sm text-dark-400 mb-3 truncate">{user.email}</div>
              <button
                onClick={() => handleTestNotification(user.email)}
                disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-3 py-2 rounded-md text-sm transition-colors"
              >
                Send Test Notification
              </button>
            </div>
          ))}
        </div>
        <div className="mt-4 text-sm text-dark-400">
          Click any button above to send a test notification to that user. They should receive it instantly if logged in.
        </div>
      </div>

      {/* User Management */}
      <div className="card mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">User & Admin Management</h2>
          <button
            onClick={() => setShowCreateUser(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create User</span>
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="input-field"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admins</option>
            <option value="user">Users</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Blocked</option>
          </select>
          <button
            onClick={() => {
              setSearchTerm('')
              setRoleFilter('all')
              setStatusFilter('all')
              setCurrentPage(1)
            }}
            className="btn-secondary"
          >
            Clear Filters
          </button>
        </div>

        {/* Users List */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user._id} className="bg-dark-800 rounded-lg p-4">
                {editingUser === user._id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        className="input-field"
                        placeholder="Name"
                      />
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                        className="input-field"
                        placeholder="Email"
                      />
                      <select
                        value={editForm.role}
                        onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                        className="input-field"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleUpdateUser(user._id)}
                        disabled={saving}
                        className="btn-primary flex items-center space-x-2"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save</span>
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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${user.isActive ? 'bg-green-400' : 'bg-red-400'}`}></div>
                      <div>
                        <div className="font-medium text-white">{user.name}</div>
                        <div className="text-sm text-dark-400">{user.email}</div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        user.role === 'admin' 
                          ? 'bg-purple-900 text-purple-300' 
                          : 'bg-blue-900 text-blue-300'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => startEdit(user)}
                        className="p-2 text-blue-400 hover:text-blue-300"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditCalendar(user._id)}
                        className="p-2 text-yellow-400 hover:text-yellow-300"
                        title="Edit Calendar"
                      >
                        <CalendarDays className="w-4 h-4" />
                      </button>
                      {user.role === 'admin' && (
                        <button
                          onClick={() => handleEditAdminOverride(user._id)}
                          className="p-2 text-orange-400 hover:text-orange-300"
                          title="Admin Override (Joining Date & Streak)"
                        >
                          <Crown className="w-4 h-4" />
                        </button>
                      )}
                      {user.role === 'admin' && (
                        <button
                          onClick={() => handleEditAdminCalendar(user._id)}
                          className="p-2 text-purple-400 hover:text-purple-300"
                          title="Admin Calendar Override"
                        >
                          <Calendar className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleUserStatus(user._id, user.isActive)}
                        className={`p-2 ${user.isActive ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'}`}
                        title={user.isActive ? 'Block' : 'Unblock'}
                      >
                        {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleChangeRole(user._id, user.role === 'admin' ? 'user' : 'admin')}
                        className="p-2 text-purple-400 hover:text-purple-300"
                        title={user.role === 'admin' ? 'Demote' : 'Promote'}
                      >
                        <Crown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user._id, user.name)}
                        className="p-2 text-red-400 hover:text-red-300"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center space-x-2 mt-6">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded ${
                  currentPage === page
                    ? 'bg-purple-600 text-white'
                    : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-white mb-4">Create New User</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                value={createForm.name}
                onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                className="input-field w-full"
              />
              <input
                type="email"
                placeholder="Email"
                value={createForm.email}
                onChange={(e) => setCreateForm({...createForm, email: e.target.value})}
                className="input-field w-full"
              />
              <input
                type="password"
                placeholder="Password"
                value={createForm.password}
                onChange={(e) => setCreateForm({...createForm, password: e.target.value})}
                className="input-field w-full"
              />
              <select
                value={createForm.role}
                onChange={(e) => setCreateForm({...createForm, role: e.target.value})}
                className="input-field w-full"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleCreateUser}
                disabled={saving}
                className="btn-primary flex-1"
              >
                {saving ? 'Creating...' : 'Create User'}
              </button>
              <button
                onClick={() => {
                  setShowCreateUser(false)
                  setCreateForm({ name: '', email: '', password: '', role: 'user' })
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Edit Modal */}
      {editingCalendar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
              <CalendarDays className="w-5 h-5 text-yellow-400" />
              <span>Edit Calendar & Streak Data</span>
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1">
                    Current Streak
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={calendarForm.currentStreak || 0}
                    onChange={(e) => setCalendarForm({
                      ...calendarForm, 
                      currentStreak: parseInt(e.target.value) || 0
                    })}
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1">
                    Longest Streak
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={calendarForm.longestStreak || 0}
                    onChange={(e) => setCalendarForm({
                      ...calendarForm, 
                      longestStreak: parseInt(e.target.value) || 0
                    })}
                    className="input-field w-full"
                  />
                </div>
              </div>
              
              <div className="bg-dark-800 rounded-lg p-4">
                <h4 className="text-sm font-medium text-white mb-3">Calendar Status Control</h4>
                <div className="text-xs text-dark-400 mb-3">
                  Note: Full calendar editing interface can be expanded here. 
                  Current implementation allows streak modification which affects calendar calculations.
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span className="text-dark-300">Completed Days</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-dark-600 rounded"></div>
                    <span className="text-dark-300">Incomplete Days</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => handleUpdateCalendar(editingCalendar)}
                disabled={saving}
                className="btn-primary flex-1 flex items-center justify-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
              <button
                onClick={cancelCalendarEdit}
                className="btn-secondary flex-1 flex items-center justify-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Override Modal */}
      {editingAdminOverride && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
              <Crown className="w-5 h-5 text-orange-400" />
              <span>Admin Override - Joining Date & Streak</span>
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1">
                  Joining Date
                </label>
                <input
                  type="date"
                  value={adminOverrideForm.joinedAt}
                  onChange={(e) => setAdminOverrideForm({
                    ...adminOverrideForm, 
                    joinedAt: e.target.value
                  })}
                  className="input-field w-full"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1">
                    Current Streak
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={adminOverrideForm.currentStreak}
                    onChange={(e) => setAdminOverrideForm({
                      ...adminOverrideForm, 
                      currentStreak: parseInt(e.target.value) || 0
                    })}
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1">
                    Longest Streak
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={adminOverrideForm.longestStreak}
                    onChange={(e) => setAdminOverrideForm({
                      ...adminOverrideForm, 
                      longestStreak: parseInt(e.target.value) || 0
                    })}
                    className="input-field w-full"
                  />
                </div>
              </div>
              
              <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4">
                <h4 className="text-sm font-medium text-orange-300 mb-2">⚠️ Admin Override Warning</h4>
                <p className="text-xs text-orange-200">
                  These changes will override the admin's actual data and be immediately visible in their dashboard. 
                  The admin cannot revert these changes.
                </p>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => handleUpdateAdminJoiningDate(editingAdminOverride)}
                disabled={saving}
                className="btn-primary flex-1 flex items-center justify-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Updating...' : 'Update Joining Date'}</span>
              </button>
              <button
                onClick={() => handleUpdateAdminStreak(editingAdminOverride)}
                disabled={saving}
                className="btn-secondary flex-1 flex items-center justify-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Updating...' : 'Update Streak'}</span>
              </button>
              <button
                onClick={cancelAdminOverride}
                className="btn-secondary flex items-center justify-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Calendar Override Modal */}
      {editingAdminCalendar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              <span>Admin Calendar Override</span>
            </h3>
            
            {/* Add New Entry */}
            <div className="bg-dark-800 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-medium text-white mb-3">Add Calendar Entry</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1">Date</label>
                  <input
                    type="date"
                    value={newCalendarEntry.date}
                    onChange={(e) => setNewCalendarEntry({
                      ...newCalendarEntry,
                      date: e.target.value
                    })}
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1">Status</label>
                  <select
                    value={newCalendarEntry.status}
                    onChange={(e) => setNewCalendarEntry({
                      ...newCalendarEntry,
                      status: e.target.value
                    })}
                    className="input-field w-full"
                  >
                    <option value="done">Completed</option>
                    <option value="missed">Not Completed</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => handleAddCalendarEntry(editingAdminCalendar)}
                    disabled={saving}
                    className="btn-primary w-full flex items-center justify-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Entry</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Existing Entries */}
            <div className="space-y-3 mb-6">
              <h4 className="text-sm font-medium text-white">Existing Calendar Entries</h4>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {adminCalendarEntries.map((entry) => (
                  <div key={entry._id} className="bg-dark-800 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-white font-medium">
                        {new Date(entry.date).toLocaleDateString()}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        entry.status === 'done' 
                          ? 'bg-green-900 text-green-300' 
                          : 'bg-red-900 text-red-300'
                      }`}>
                        {entry.status === 'done' ? 'Completed' : 'Not Completed'}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleUpdateCalendarEntry(
                          editingAdminCalendar, 
                          entry.date, 
                          entry.status === 'done' ? 'missed' : 'done'
                        )}
                        disabled={saving}
                        className={`px-3 py-1 rounded text-xs font-medium ${
                          entry.status === 'done'
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        {entry.status === 'done' ? 'Mark Missed' : 'Mark Done'}
                      </button>
                    </div>
                  </div>
                ))}
                {adminCalendarEntries.length === 0 && (
                  <div className="text-center py-8 text-dark-400">
                    No calendar entries found
                  </div>
                )}
              </div>
            </div>

            <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-medium text-purple-300 mb-2">⚠️ Calendar Override Warning</h4>
              <p className="text-xs text-purple-200">
                Calendar changes will be immediately visible in the admin's dashboard and affect their streak calculations. 
                You can backdate or future-date entries as needed.
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={cancelAdminCalendar}
                className="btn-secondary flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Close</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert Component */}
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

export default SuperAdmin