import { apiClient } from '../../../config/api/client'

export type HealthStatus = {
  status: 'ok' | 'degraded' | 'down'
  timestamp: string
  region?: string
}

export const fetchHealthStatus = async (): Promise<HealthStatus> => {
  return apiClient.get('/core/health')
}
