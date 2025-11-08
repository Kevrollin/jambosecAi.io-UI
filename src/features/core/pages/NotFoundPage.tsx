import { Link } from 'react-router-dom'
import { paths } from '../../../routes/paths'

export const NotFoundPage = () => {
  return (
    <div className="space-y-3 text-center">
      <h2 className="text-2xl font-semibold text-slate-900">Page not found</h2>
      <p className="text-slate-600">The page you requested does not exist.</p>
      <Link className="text-sm font-semibold text-indigo-600 hover:text-indigo-500" to={paths.root}>
        Go back home
      </Link>
    </div>
  )
}
