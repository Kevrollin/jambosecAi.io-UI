import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { paths } from '../routes/paths'
import { useAuth } from '../features/accounts/context/AuthContext'
import { ApiError } from '../config/api/client'


export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const [loginValue, setLoginValue] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const getErrorMessage = (err: unknown): string => {
    if (err instanceof ApiError) {
      const { body } = err
      if (body && typeof body === 'object' && 'detail' in body && typeof body.detail === 'string') {
        return body.detail
      }
      if (typeof body === 'string' && body.trim().length > 0) {
        return body
      }
      return 'Unable to sign in. Please check your credentials.'
    }

    if (err instanceof Error) {
      return err.message
    }

    return 'Unexpected error occurred while signing in.'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await login({
        login: loginValue.trim(),
        password,
        remember: rememberMe,
      })
      // Redirect to chat page after login
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || paths.chat.root
      navigate(from, { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center text-gray-800">
          Welcome Back!
        </h1>
        <p className="text-center text-gray-600">Login to your JamboSec account</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label 
              htmlFor="login" 
              className="text-sm font-medium text-gray-700"
            >
              Email or username
            </label>
            <input
              id="login"
              name="login"
              type="text"
              autoComplete="email"
              required
              value={loginValue}
              onChange={(e) => setLoginValue(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label 
              htmlFor="password" 
              className="text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=" StrongP@ssw0rd!" // Placeholder added
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="remember-me" className="ml-2 text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a 
                href="#" // Placeholder for forgot password link
                className="font-medium text-blue-800 hover:text-blue-700 hover:underline" // Navy blue for forgot password
              >
                Forgot your password?
              </a>
            </div>
          </div>

          {error && (
            <p className="text-sm text-center text-red-600">{error}</p>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 font-semibold text-white bg-blue-800 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400" // Navy blue button
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>
        
        <p className="text-sm text-center text-gray-600">
          Don't have an account?{' '}
          <Link to={paths.auth.signup} className="font-medium text-blue-800 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}