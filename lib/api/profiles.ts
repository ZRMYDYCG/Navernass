import { supabase } from "../supabase";
import type { Profile, UpdateProfileDto } from "./types";

export const profilesApi = {
  /**
   * 获取当前用户的 profile
   */
  getCurrent: async (): Promise<Profile> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("未登录");

    const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();

    if (error) throw error;
    return data;
  },

  /**
   * 根据 ID 获取用户 profile
   */
  getById: async (id: string): Promise<Profile> => {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", id).single();

    if (error) throw error;
    return data;
  },

  /**
   * 更新当前用户的 profile
   */
  update: async (updates: UpdateProfileDto): Promise<Profile> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("未登录");

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * 上传头像
   */
  uploadAvatar: async (file: File): Promise<string> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("未登录");

    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}-${Math.random()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file);

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filePath);

    return publicUrl;
  },
};
