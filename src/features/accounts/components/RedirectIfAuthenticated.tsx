import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { paths } from '../../../routes/paths'
import { useAuth } from '../context/AuthContext'

type RedirectIfAuthenticatedProps = {
  children: ReactNode
}

/**
 * Component that redirects authenticated users away from auth pages (login/signup)
 * to the chat page. Unauthenticated users can access the children normally.
 */
export const RedirectIfAuthenticated = ({ children }: RedirectIfAuthenticatedProps) => {
  const { status, isAuthenticated } = useAuth()

  // Show children while checking auth status
  if (status === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-lg border border-slate-200 bg-white px-6 py-4 text-slate-600 shadow-sm">
          Loading…
        </div>
      </div>
    )
  }

  // If authenticated, redirect to chat page
  if (isAuthenticated) {
    return <Navigate to={paths.chat.root} replace />
  }

  // Not authenticated, show auth pages
  return <>{children}</>
}

