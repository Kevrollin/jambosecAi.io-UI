import { useMemo } from 'react'
import { useAuth } from '../context/AuthContext'

export const useCurrentAccount = () => {
  const { account, status, error, refreshAccount } = useAuth()

  return useMemo(() => ({
    account,
    loading: status === 'checking',
    error,
    reload: refreshAccount,
  }), [account, error, refreshAccount, status])
}
