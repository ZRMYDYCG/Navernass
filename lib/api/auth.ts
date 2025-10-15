import { supabase } from "../supabase";

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name?: string;
}

export const authApi = {
  /**
   * 用户登录
   */
  login: async (data: LoginDto) => {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) throw error;
    return authData;
  },

  /**
   * 用户注册
   */
  register: async (data: RegisterDto) => {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
        },
      },
    });

    if (error) throw error;
    return authData;
  },

  /**
   * 获取当前用户信息
   */
  getCurrentUser: async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) throw error;
    return user;
  },

  /**
   * 退出登录
   */
  logout: async () => {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;
  },
};
