import http from '../lib/http';
import { AxiosResponse } from 'axios';

export interface JobListResponse {
  normal: string[];
  recent: string[];
  isDev: boolean;
}

export interface JobActionResponse {
  message: string;
  isDev: boolean;
}

export function getJobList(): Promise<AxiosResponse<JobListResponse>> {
  return http.get<JobListResponse>('/job/list');
}

export function startJob(userId: string): Promise<AxiosResponse<JobActionResponse>> {
  return http.get<JobActionResponse>('/job/start', { params: { userId } });
}

export function stopJob(userId: string): Promise<AxiosResponse<JobActionResponse>> {
  return http.get<JobActionResponse>('/job/stop', { params: { userId } });
}

export function recentStartJob(userId: string): Promise<AxiosResponse<JobActionResponse>> {
  return http.get<JobActionResponse>('/job/recent/start', { params: { userId } });
}

export function recentStopJob(userId: string): Promise<AxiosResponse<JobActionResponse>> {
  return http.get<JobActionResponse>('/job/recent/stop', { params: { userId } });
}
