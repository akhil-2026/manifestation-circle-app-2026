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
  Search
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
  const [showCreateUser, setShowCreateUser] = useState(false)
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
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

  const handleDeleteUser = async (userId, userName) => {
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