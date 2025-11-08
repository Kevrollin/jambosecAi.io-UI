import { apiClient } from '../../../config/api/client'
import { endpoints } from '../../../config/api/endpoints'

export type PrivacyPolicy = {
  content: string
  updatedAt: string
}

export const fetchPrivacyPolicy = (): Promise<PrivacyPolicy> => {
  return apiClient.get(endpoints.policy.privacy)
}
