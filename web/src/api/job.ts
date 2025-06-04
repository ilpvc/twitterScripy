import http from '../lib/http';
import { AxiosResponse } from 'axios';

export interface JobListResponse {
  normal: string[];
  recent: string[];
  isDev: boolean;
}

export function getJobList(): Promise<AxiosResponse<JobListResponse>> {
  return http.get<JobListResponse>('/job/list');
}
