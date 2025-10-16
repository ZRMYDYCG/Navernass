import { supabase } from "../supabase";
import type { Chapter, CreateChapterDto, UpdateChapterDto } from "./types";

export const chaptersApi = {
  /**
   * 获取小说的所有章节
   */
  getByNovelId: async (novelId: string): Promise<Chapter[]> => {
    const { data, error } = await supabase
      .from("chapters")
      .select("*")
      .eq("novel_id", novelId)
      .order("order_index", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * 获取单个章节详情
   */
  getById: async (id: string): Promise<Chapter> => {
    const { data, error } = await supabase.from("chapters").select("*").eq("id", id).single();

    if (error) throw error;
    return data;
  },

  /**
   * 创建章节
   */
  create: async (chapterData: CreateChapterDto): Promise<Chapter> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("未登录");

    // 计算字数
    const wordCount = chapterData.content ? chapterData.content.replace(/<[^>]*>/g, "").length : 0;

    const { data, error } = await supabase
      .from("chapters")
      .insert({
        user_id: user.id,
        novel_id: chapterData.novel_id,
        title: chapterData.title,
        content: chapterData.content || "",
        order_index: chapterData.order_index,
        word_count: wordCount,
        status: "draft",
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * 更新章节
   */
  update: async (chapterData: UpdateChapterDto): Promise<Chapter> => {
    const { id, ...updates } = chapterData;

    // 如果更新了内容，重新计算字数
    const updateData: Record<string, unknown> = { ...updates };
    if (updates.content !== undefined) {
      updateData.word_count = updates.content.replace(/<[^>]*>/g, "").length;
    }

    console.log("📝 准备更新章节到数据库:", {
      chapterId: id,
      contentLength: updates.content?.length || 0,
      wordCount: updateData.word_count,
    });

    const { data, error } = await supabase
      .from("chapters")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("❌ 数据库更新失败:", error);
      throw error;
    }

    console.log("✅ 数据库更新成功:", {
      chapterId: data.id,
      contentLength: data.content?.length || 0,
      wordCount: data.word_count,
    });

    return data;
  },

  /**
   * 删除章节
   */
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from("chapters").delete().eq("id", id);

    if (error) throw error;
  },

  /**
   * 批量更新章节顺序
   */
  updateOrder: async (chapters: Array<{ id: string; order_index: number }>): Promise<void> => {
    const promises = chapters.map(({ id, order_index }) =>
      supabase.from("chapters").update({ order_index }).eq("id", id)
    );

    const results = await Promise.all(promises);
    const errors = results.filter((r) => r.error);

    if (errors.length > 0) {
      throw new Error("批量更新章节顺序失败");
    }
  },

  /**
   * 发布章节
   */
  publish: async (id: string): Promise<Chapter> => {
    const { data, error } = await supabase
      .from("chapters")
      .update({ status: "published" })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * 取消发布章节
   */
  unpublish: async (id: string): Promise<Chapter> => {
    const { data, error } = await supabase
      .from("chapters")
      .update({ status: "draft" })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
