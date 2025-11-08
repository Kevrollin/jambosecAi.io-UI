import { PropsWithChildren } from 'react'
import { SettingsProvider } from '../../providers/SettingsProvider'
import { AuthProvider } from '../../features/accounts/context/AuthContext'
import { NavbarProvider } from '../../components/NavbarContext'

export const AppProviders = ({ children }: PropsWithChildren) => {
  return (
    <SettingsProvider>
      <AuthProvider>
        <NavbarProvider>{children}</NavbarProvider>
      </AuthProvider>
    </SettingsProvider>
  )
}
