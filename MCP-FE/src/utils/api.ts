// utils/api.ts
import { ApiConfig } from '../types/validation';

export const simulateApiCall = async (config: ApiConfig, data: Record<string, any>) => {
  await new Promise(res => setTimeout(res, 1500));
  if (Math.random() < 0.1) throw new Error('Network error: Please try again later');
  return { success: true, message: 'Data submitted successfully', id: Math.random().toString(36).substr(2, 9), data };
};
