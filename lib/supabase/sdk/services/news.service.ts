import { supabase } from "@/lib/supabase";
import type { News, CreateNewsDto, UpdateNewsDto } from "../types";

export class NewsService {
  /**
   * 获取新闻列表
   */
  async getList(params?: {
    type?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  }) {
    let query = supabase
      .from("news")
      .select("*")
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false });

    // 筛选类型
    if (params?.type) {
      query = query.eq("type", params.type);
    }

    // 筛选状态
    if (params?.status) {
      query = query.eq("status", params.status);
    } else {
      // 默认只显示已发布的
      query = query.eq("status", "published");
    }

    // 分页
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query
      .range(from, to);

    if (error) throw error;

    return {
      data: data || [],
      total: count || 0,
      page,
      pageSize,
    };
  }

  /**
   * 获取新闻详情
   */
  async getById(id: string) {
    const { data, error } = await supabase
      .from("news")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        throw {
          statusCode: 404,
          code: "NEWS_NOT_FOUND",
          message: "News not found",
        };
      }
      throw error;
    }

    return data;
  }

  /**
   * 创建新闻
   */
  async create(newsData: CreateNewsDto) {
    const { data, error } = await supabase
      .from("news")
      .insert({
        type: newsData.type,
        title: newsData.title,
        content: newsData.content,
        image: newsData.image,
        link: newsData.link,
        author: newsData.author,
        priority: newsData.priority || 0,
        status: 'published',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * 更新新闻
   */
  async update(id: string, updates: Partial<UpdateNewsDto>) {
    await this.getById(id);

    const { data, error } = await supabase
      .from("news")
      .update({
        type: updates.type,
        title: updates.title,
        content: updates.content,
        image: updates.image,
        link: updates.link,
        author: updates.author,
        status: updates.status,
        priority: updates.priority,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * 删除新闻
   */
  async delete(id: string) {
    await this.getById(id);

    const { error } = await supabase
      .from("news")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  /**
   * 增加阅读计数
   */
  async incrementReadCount(id: string) {
    const { error } = await supabase.rpc('increment_news_read_count', {
      news_id: id,
    });

    if (error) throw error;
  }
}
