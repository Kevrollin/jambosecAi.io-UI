import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCurrentAccount } from '../hooks/useCurrentAccount'
import { useAuth } from '../context/AuthContext'
import { useNavbar } from '../../../components/NavbarContext'
import {
  updateProfile,
  getUserStats,
  deleteAccount,
  changePassword,
  type UpdateProfilePayload,
  type UserStats,
} from '../services/accountService'
import { paths } from '../../../routes/paths'
import {
  User,
  Mail,
  Calendar,
  Edit2,
  Lock,
  Trash2,
  MessageSquare,
  ThumbsUp,
  BarChart3,
  Save,
  X,
  AlertTriangle,
} from 'lucide-react'

export const AccountOverviewPage = () => {
  const { account, loading, error, reload } = useCurrentAccount()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const { toggleMobileMenu } = useNavbar()
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [saveLoading, setSaveLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Form states
  const [formData, setFormData] = useState<UpdateProfilePayload>({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
  })
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  })

  // Load stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        setStatsLoading(true)
        const userStats = await getUserStats()
        setStats(userStats)
      } catch (err) {
        console.error('Failed to load stats:', err)
      } finally {
        setStatsLoading(false)
      }
    }

    if (account) {
      loadStats()
    }
  }, [account])

  // Initialize form data when account loads
  useEffect(() => {
    if (account && !isEditing) {
      setFormData({
        username: account.username,
        email: account.email,
        first_name: account.firstName,
        last_name: account.lastName,
      })
    }
  }, [account, isEditing])

  const handleEdit = () => {
    setIsEditing(true)
    setErrorMessage(null)
    setSuccessMessage(null)
  }

  const handleCancel = () => {
    setIsEditing(false)
    if (account) {
      setFormData({
        username: account.username,
        email: account.email,
        first_name: account.firstName,
        last_name: account.lastName,
      })
    }
    setErrorMessage(null)
  }

  const handleSave = async () => {
    if (!account) return

    setSaveLoading(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      // Validate
      if (!formData.username?.trim()) {
        setErrorMessage('Username is required')
        setSaveLoading(false)
        return
      }
      if (!formData.email?.trim()) {
        setErrorMessage('Email is required')
        setSaveLoading(false)
        return
      }

      await updateProfile(formData)
      setSuccessMessage('Profile updated successfully!')
      setIsEditing(false)
      await reload()
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.detail ||
        err?.response?.data?.username?.[0] ||
        err?.response?.data?.email?.[0] ||
        'Failed to update profile'
      setErrorMessage(errorMsg)
    } finally {
      setSaveLoading(false)
    }
  }

  const handleChangePassword = async () => {
    setPasswordLoading(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      if (!passwordData.old_password || !passwordData.new_password) {
        setErrorMessage('All password fields are required')
        setPasswordLoading(false)
        return
      }

      if (passwordData.new_password !== passwordData.confirm_password) {
        setErrorMessage('New passwords do not match')
        setPasswordLoading(false)
        return
      }

      if (passwordData.new_password.length < 8) {
        setErrorMessage('Password must be at least 8 characters')
        setPasswordLoading(false)
        return
      }

      await changePassword({
        old_password: passwordData.old_password,
        new_password: passwordData.new_password,
      })

      setSuccessMessage('Password changed successfully!')
      setPasswordData({
        old_password: '',
        new_password: '',
        confirm_password: '',
      })
      setIsChangingPassword(false)
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.detail || 'Failed to change password'
      setErrorMessage(errorMsg)
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!isDeleting) {
      setIsDeleting(true)
      return
    }

    setDeleteLoading(true)
    setErrorMessage(null)

    try {
      await deleteAccount()
      await logout()
      navigate(paths.root, { replace: true })
    } catch (err: any) {
      const errorMsg = err?.response?.data?.detail || 'Failed to delete account'
      setErrorMessage(errorMsg)
      setIsDeleting(false)
      setDeleteLoading(false)
    }
  }

  const hasError = Boolean(error)
  const displayAccount = account

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
          <div className="flex items-center gap-3">
            {/* Hamburger Menu Button - Mobile Only */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              aria-label="Open menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900 sm:text-2xl lg:text-3xl">
                Account Settings
              </h1>
              <p className="mt-1 text-xs text-gray-600 sm:text-sm">
                Manage your profile, security, and account preferences
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm sm:text-base">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
            <p className="text-sm sm:text-base">{successMessage}</p>
          </div>
        )}

        {loading && (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
            <p className="text-gray-500">Loading account...</p>
          </div>
        )}

        {hasError && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            <p className="font-medium">Failed to load the account.</p>
            <button
              className="mt-2 text-sm underline"
              onClick={() => void reload()}
            >
              Retry
            </button>
          </div>
        )}

        {displayAccount && (
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-4 py-4 sm:px-6 sm:py-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
                    Profile Information
                  </h2>
                  {!isEditing && (
                    <button
                      onClick={handleEdit}
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 sm:px-4"
                    >
                      <Edit2 className="h-4 w-4" />
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="px-4 py-4 sm:px-6 sm:py-5">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Username
                        </label>
                        <input
                          type="text"
                          value={formData.username}
                          onChange={(e) =>
                            setFormData({ ...formData, username: e.target.value })
                          }
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Email
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={formData.first_name}
                          onChange={(e) =>
                            setFormData({ ...formData, first_name: e.target.value })
                          }
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={formData.last_name}
                          onChange={(e) =>
                            setFormData({ ...formData, last_name: e.target.value })
                          }
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-end pt-2">
                      <button
                        onClick={handleCancel}
                        disabled={saveLoading}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saveLoading}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                      >
                        <Save className="h-4 w-4" />
                        {saveLoading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-500 sm:text-sm">
                          Username
                        </p>
                        <p className="mt-1 text-sm text-gray-900 sm:text-base">
                          {displayAccount.username}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-500 sm:text-sm">
                          Email
                        </p>
                        <p className="mt-1 text-sm text-gray-900 sm:text-base break-all">
                          {displayAccount.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-500 sm:text-sm">
                          Full Name
                        </p>
                        <p className="mt-1 text-sm text-gray-900 sm:text-base">
                          {displayAccount.displayName || 'Not set'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-500 sm:text-sm">
                          Joined
                        </p>
                        <p className="mt-1 text-sm text-gray-900 sm:text-base">
                          {new Date(displayAccount.joinedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Statistics Card */}
            {stats && (
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 px-4 py-4 sm:px-6 sm:py-5">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-gray-600" />
                    <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
                      Your Activity
                    </h2>
                  </div>
                </div>
                <div className="px-4 py-4 sm:px-6 sm:py-5">
                  {statsLoading ? (
                    <p className="text-sm text-gray-500">Loading statistics...</p>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="h-4 w-4 text-blue-600" />
                          <p className="text-xs font-medium text-gray-600">Chat Sessions</p>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                          {stats.chat.total_sessions}
                        </p>
                      </div>
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="h-4 w-4 text-green-600" />
                          <p className="text-xs font-medium text-gray-600">Messages</p>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                          {stats.chat.total_messages}
                        </p>
                      </div>
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <ThumbsUp className="h-4 w-4 text-purple-600" />
                          <p className="text-xs font-medium text-gray-600">Feedback</p>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                          {stats.feedback.total}
                        </p>
                      </div>
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <ThumbsUp className="h-4 w-4 text-orange-600" />
                          <p className="text-xs font-medium text-gray-600">Helpful</p>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                          {stats.feedback.helpful}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Change Password Card */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-4 py-4 sm:px-6 sm:py-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-gray-600" />
                    <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
                      Change Password
                    </h2>
                  </div>
                  {!isChangingPassword && (
                    <button
                      onClick={() => setIsChangingPassword(true)}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      Change
                    </button>
                  )}
                </div>
              </div>

              {isChangingPassword && (
                <div className="px-4 py-4 sm:px-6 sm:py-5">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.old_password}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            old_password: e.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.new_password}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            new_password: e.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirm_password}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            confirm_password: e.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-end pt-2">
                      <button
                        onClick={() => {
                          setIsChangingPassword(false)
                          setPasswordData({
                            old_password: '',
                            new_password: '',
                            confirm_password: '',
                          })
                        }}
                        disabled={passwordLoading}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </button>
                      <button
                        onClick={handleChangePassword}
                        disabled={passwordLoading}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                      >
                        <Save className="h-4 w-4" />
                        {passwordLoading ? 'Changing...' : 'Change Password'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Delete Account Card */}
            <div className="rounded-xl border border-red-200 bg-red-50 shadow-sm">
              <div className="px-4 py-4 sm:px-6 sm:py-5">
                <div className="flex items-start gap-3">
                  <Trash2 className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold text-red-900 sm:text-xl">
                      Delete Account
                    </h2>
                    <p className="mt-2 text-sm text-red-700">
                      Once you delete your account, there is no going back. Please be
                      certain.
                    </p>
                    {isDeleting && (
                      <div className="mt-4 space-y-3">
                        <p className="text-sm font-medium text-red-900">
                          Are you sure you want to delete your account? This action cannot
                          be undone.
                        </p>
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <button
                            onClick={() => setIsDeleting(false)}
                            disabled={deleteLoading}
                            className="inline-flex items-center justify-center rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleDeleteAccount}
                            disabled={deleteLoading}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            {deleteLoading ? 'Deleting...' : 'Yes, Delete My Account'}
                          </button>
                        </div>
                      </div>
                    )}
                    {!isDeleting && (
                      <button
                        onClick={() => setIsDeleting(true)}
                        className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Account
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
