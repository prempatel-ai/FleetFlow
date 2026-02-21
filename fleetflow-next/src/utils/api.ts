import axios, { InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        if (typeof window !== 'undefined') {
            const userInfoStr = localStorage.getItem('userInfo');
            if (userInfoStr) {
                try {
                    const userInfo = JSON.parse(userInfoStr);
                    if (userInfo && userInfo.token) {
                        config.headers.Authorization = `Bearer ${userInfo.token}`;
                    }
                } catch (e) {
                    console.error('Failed to parse user info from localStorage', e);
                }
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
