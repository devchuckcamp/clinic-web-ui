import { apiClient } from './api';
import { API_CONFIG } from './config';
import type { Clinic } from '@/types';

export const clinicService = {
  async getClinic(): Promise<Clinic> {
    return apiClient.get<Clinic>(API_CONFIG.endpoints.clinic);
  },
};
