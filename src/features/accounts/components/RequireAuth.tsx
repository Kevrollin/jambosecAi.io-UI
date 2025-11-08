import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { paths } from '../../../routes/paths'
import { useAuth } from '../context/AuthContext'

type RequireAuthProps = {
  children: ReactNode
}

export const RequireAuth = ({ children }: RequireAuthProps) => {
  const location = useLocation()
  const { status, isAuthenticated, refreshAccount } = useAuth()

  if (status === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-lg border border-slate-200 bg-white px-6 py-4 text-slate-600 shadow-sm">
          Verifying session…
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="space-y-4 rounded-lg border border-amber-200 bg-amber-50 px-6 py-4 text-slate-700 shadow-sm">
          <p className="font-medium">We couldn’t verify your session.</p>
          <button
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
            onClick={() => void refreshAccount()}
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={paths.auth.login} replace state={{ from: location }} />
  }

  return <>{children}</>
}

