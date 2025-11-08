import { useCallback, useEffect, useMemo, useState } from 'react'

type AsyncState<T> = {
  data?: T
  error?: unknown
  status: 'idle' | 'loading' | 'success' | 'error'
}

type UseAsyncValueResult<T> = AsyncState<T> & {
  reload: () => Promise<void>
}

export const useAsyncValue = <T>(load: () => Promise<T>): UseAsyncValueResult<T> => {
  const [state, setState] = useState<AsyncState<T>>({ status: 'idle' })

  const execute = useCallback(async () => {
    setState({ status: 'loading' })

    try {
      const data = await load()
      setState({ data, status: 'success' })
    } catch (error) {
      setState({ error, status: 'error' })
    }
  }, [load])

  useEffect(() => {
    execute()
  }, [execute])

  const reload = useCallback(async () => {
    await execute()
  }, [execute])

  return useMemo(() => ({ ...state, reload }), [reload, state])
}
