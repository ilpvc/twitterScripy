import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import config from '../config';

const http = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
http.interceptors.request.use(
  (req: InternalAxiosRequestConfig) => {
    // 可在此添加token等
    return req;
  },
  (error: any) => Promise.reject(error)
);

// 响应拦截器
http.interceptors.response.use(
  (res: AxiosResponse) => {
      console.log(res);
      return res.data
  },
  (error: any) => {
    // 可统一处理错误
    return Promise.reject(error);
  }
);

export default http; 