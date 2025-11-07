import { supabase } from "@/lib/supabase";
import type { Chapter, CreateChapterDto, UpdateChapterDto } from "../types";

export class ChaptersService {
  /**
   * 获取小说的所有章节
   */
  async getByNovelId(novelId: string) {
    const { data, error } = await supabase
      .from("chapters")
      .select("*")
      .eq("novel_id", novelId)
      .order("order_index", { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * 获取单个章节
   */
  async getById(id: string) {
    const { data, error } = await supabase
      .from("chapters")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        throw {
          statusCode: 404,
          code: "CHAPTER_NOT_FOUND",
          message: "Chapter not found",
        };
      }
      throw error;
    }

    return data;
  }

  /**
   * 创建章节
   */
  async create(chapterData: CreateChapterDto) {
    // 计算字数
    const wordCount = chapterData.content
      ? chapterData.content.replace(/<[^>]*>/g, "").length
      : 0;

    const { data, error } = await supabase
      .from("chapters")
      .insert({
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
  }

  /**
   * 更新章节
   */
  async update(id: string, updates: Partial<UpdateChapterDto>) {
    await this.getById(id);

    const updateData: Record<string, unknown> = { ...updates };

    // 如果更新了内容，重新计算字数
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
  }

  /**
   * 删除章节
   */
  async delete(id: string) {
    await this.getById(id);

    const { error } = await supabase.from("chapters").delete().eq("id", id);

    if (error) throw error;
  }

  /**
   * 批量更新章节顺序
   */
  async updateOrder(chapters: Array<{ id: string; order_index: number }>) {
    const promises = chapters.map(({ id, order_index }) =>
      supabase.from("chapters").update({ order_index }).eq("id", id)
    );

    const results = await Promise.all(promises);
    const errors = results.filter((r) => r.error);

    if (errors.length > 0) {
      throw {
        statusCode: 400,
        code: "UPDATE_ORDER_FAILED",
        message: "Failed to update chapter order",
      };
    }
  }

  /**
   * 发布章节
   */
  async publish(id: string) {
    return this.update(id, { status: "published" });
  }

  /**
   * 取消发布章节
   */
  async unpublish(id: string) {
    return this.update(id, { status: "draft" });
  }
}

