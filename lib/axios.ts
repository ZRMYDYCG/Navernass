import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { toast } from "sonner";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  timeout: 50000,
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (process.env.NODE_ENV === "development") {
      console.log("📤 请求:", config.method?.toUpperCase(), config.url, config.data);
    }
    return config;
  },
  (error: AxiosError) => {
    console.error("❌ 请求错误:", error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === "development") {
      console.log("📥 响应:", response.config.url, response.data);
    }
    return response.data;
  },
  (error: AxiosError<{ message?: string; error?: string }>) => {
    const { response, message } = error;
    if (response) {
      const { status, data } = response;

      switch (status) {
        case 401:
          toast.error("未授权，请重新登录");
          if (typeof window !== "undefined") {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }
          break;
        case 403:
          toast.error("无权限，请重新登录");
          break;
        case 404:
          toast.error("资源不存在");
          break;
        case 422:
          toast.error("验证失败");
          break;
        case 500:
          toast.error("服务器错误");
          break;
        default:
          toast.error(`${status}:${data?.message || message}`);
      }
    } else if (message === "Network Error") {
      toast.error("❌ 网络错误");
    } else if (message.includes("timeout")) {
      toast.error("❌ 请求超时");
    } else {
      toast.error("请求失败，请稍后重试");
    }
    return Promise.reject(error);
  }
);

export default api;
