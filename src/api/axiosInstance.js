// src/api/axiosInstance.js

import axios from 'axios';

const API_BASE_URL = 'https://autoreactgenerator-g8g9bge3heh0addq.koreasouth-01.azurewebsites.net/api/';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// ✨ 요청 인터셉터: 모든 요청에 Access Token을 헤더에 추가
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✨ 응답 인터셉터: 401 에러 발생 시 토큰 재발급 로직
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    // 401 에러이고, 재시도한 요청이 아닐 경우
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // 재시도 플래그 설정
      
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        // refreshToken이 없으면 로그인 페이지로 리다이렉트
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${API_BASE_URL}authentication/token/refresh/`, {
          refresh: refreshToken,
        });

        const newAccessToken = response.data.access;
        localStorage.setItem('accessToken', newAccessToken);

        // 실패했던 원래 요청의 헤더를 새로운 토큰으로 변경
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        // 원래 요청을 다시 실행
        return api(originalRequest);
      } catch (refreshError) {
        // 토큰 재발급 실패 시 (e.g., Refresh Token 만료)
        console.error('Token refresh failed:', refreshError);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('username');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
