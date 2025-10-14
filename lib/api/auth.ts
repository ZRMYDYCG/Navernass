import { api } from "../axios";

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export const authApi = {
  /**
   * 用户登录
   */
  login: (data: LoginDto) => api.post("/user/login", data),

  /**
   * 用户注册
   */
  register: (data: RegisterDto) => api.post("/user/register", data),

  /**
   * 获取当前用户信息
   */
  getCurrentUser: () => api.get("/user/profile"),

  /**
   * 退出登录
   */
  logout: () => api.post("/user/logout", {}),
};
