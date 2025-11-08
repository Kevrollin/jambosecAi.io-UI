import { Outlet, useLocation } from 'react-router-dom'
import { AuthenticatedNavbar } from '../../components/AuthenticatedNavbar'
import { paths } from '../../routes/paths'

export const MainLayout = () => {
  const location = useLocation()
  const isChatPage = location.pathname === paths.chat.root

  return (
    <div className={`${isChatPage ? 'h-screen overflow-hidden flex flex-col' : 'min-h-screen'} bg-gray-50`} style={isChatPage ? { height: '100vh', maxHeight: '100vh' } : {}}>
      <AuthenticatedNavbar />
      <main className={isChatPage ? 'flex-1 overflow-hidden min-h-0 flex flex-col' : ''}>
        <Outlet />
      </main>
    </div>
  )
}
