import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { paths } from '../routes/paths'
import { useAuth } from '../features/accounts/context/AuthContext'
import { ApiError } from '../config/api/client'



export default function SignupPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signup } = useAuth()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const getErrorMessage = (err: unknown): string => {
    if (err instanceof ApiError) {
      const { body, status } = err

      if (body && typeof body === 'object') {
        if ('detail' in body && typeof body.detail === 'string') {
          return body.detail
        }

        const values = Object.values(body)
        if (values.length > 0) {
          const first = values[0]
          if (Array.isArray(first)) {
            const text = first.find((item) => typeof item === 'string')
            if (text) {
              return text
            }
          }
          if (typeof first === 'string') {
            return first
          }
        }
      }

      if (status === 400) {
        return 'We could not create your account. Please review the information and try again.'
      }

      return 'Unexpected error occurred while creating your account.'
    }

    if (err instanceof Error) {
      return err.message
    }

    return 'Unexpected error occurred while creating your account.'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== password2) {
      setError('Passwords do not match.')
      return
    }
    // Agreement check is handled by 'required' on the checkbox
    setError(null)
    setLoading(true)

    try {
      await signup({
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password,
        remember: true,
      })
      // Redirect to chat page after signup
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
          Create Account
        </h1>
        <p className="text-center text-gray-600">Get started with JamboSec</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label 
              htmlFor="username" 
              className="text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a unique username"
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label 
              htmlFor="email" 
              className="text-sm font-medium text-gray-700"
            >
              Email 
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g., juma@example.com"
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
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters, with a number"
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label 
              htmlFor="password2" 
              className="text-sm font-medium text-gray-700"
            >
              Confirm Password
            </label>
            <input
              id="password2"
              name="password2"
              type="password"
              required
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              placeholder="Repeat your password"
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="terms" className="text-gray-700">
                I agree to the{' '}
                <a href="/privacy" target="_blank" className="font-medium text-blue-800 hover:underline">
                  Privacy Policy
                </a>{' '}
                and{' '}
                <a href="/terms">Terms of service</a>
              </label>
            </div>
          </div>

          {error && (
            <p className="text-sm text-center text-red-600">{error}</p>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 font-semibold text-white bg-blue-800 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>
        
        <p className="text-sm text-center text-gray-600">
          Already have an account?{' '}
          <Link to={paths.auth.login} className="font-medium text-blue-800 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}