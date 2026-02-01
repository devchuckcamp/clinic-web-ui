import { apiClient } from './api';
import { API_CONFIG } from './config';
import type { Patient } from '@/types';

export interface PatientsListResponse {
  items: Patient[];
}

export const patientsService = {
  async listPatients(): Promise<PatientsListResponse> {
    return apiClient.get<PatientsListResponse>(API_CONFIG.endpoints.patients);
  },
};
