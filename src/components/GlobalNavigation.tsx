import { NavLink, useNavigate } from 'react-router-dom'
import { paths } from '../routes/paths'
import { useAuth } from '../features/accounts/context/AuthContext'

const links = [
  { to: paths.root, label: 'Home' },
  { to: paths.accounts.root, label: 'Accounts' },
  { to: paths.chat.root, label: 'Chat' },
  { to: paths.knowledge.root, label: 'Knowledge' },
  { to: paths.policy.privacy, label: 'Policy' },
]

export const GlobalNavigation = () => {
  const navigate = useNavigate()
  const { account, isAuthenticated, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    navigate(paths.auth.login, { replace: true })
  }

  return (
    <nav className="bg-white shadow-sm" aria-label="Main navigation">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4 text-sm font-medium">
        <ul className="flex items-center gap-6">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                className={({ isActive }) =>
                  isActive
                    ? 'text-slate-900'
                    : 'text-slate-500 transition hover:text-slate-900'
                }
                to={link.to}
                end={link.to === paths.root}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {isAuthenticated ? (
          <div className="flex items-center gap-4 text-slate-500">
            <span className="text-sm">
              {account?.displayName ?? account?.email ?? 'Signed in'}
            </span>
            <button
              className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-slate-700"
              onClick={() => void handleLogout()}
              type="button"
            >
              Log out
            </button>
          </div>
        ) : null}
      </div>
    </nav>
  )
}
