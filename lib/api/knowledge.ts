import { supabase } from "../supabase";
import type {
  KnowledgeBase,
  CreateKnowledgeBaseDto,
  UpdateKnowledgeBaseDto,
  KnowledgeItem,
  CreateKnowledgeItemDto,
  UpdateKnowledgeItemDto,
} from "./types";

// =============================================
// 知识库集合相关 API
// =============================================

export const knowledgeBasesApi = {
  /**
   * 获取所有知识库（未删除的）
   */
  getList: async (): Promise<KnowledgeBase[]> => {
    const { data, error } = await supabase
      .from("knowledge_bases")
      .select("*")
      .or("is_deleted.is.null,is_deleted.eq.false")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * 获取知识库详情
   */
  getById: async (id: string): Promise<KnowledgeBase> => {
    const { data, error } = await supabase
      .from("knowledge_bases")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * 创建知识库
   */
  create: async (kbData: CreateKnowledgeBaseDto): Promise<KnowledgeBase> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("未登录");

    const { data, error } = await supabase
      .from("knowledge_bases")
      .insert({
        user_id: user.id,
        name: kbData.name,
        description: kbData.description,
        icon: kbData.icon,
        color: kbData.color,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * 更新知识库
   */
  update: async (kbData: UpdateKnowledgeBaseDto): Promise<KnowledgeBase> => {
    const { id, ...updates } = kbData;

    const { data, error } = await supabase
      .from("knowledge_bases")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * 删除知识库（软删除）
   */
  archive: async (id: string): Promise<KnowledgeBase> => {
    const { data, error } = await supabase
      .from("knowledge_bases")
      .update({ is_deleted: true })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * 获取回收站中的知识库列表
   */
  getArchived: async (): Promise<KnowledgeBase[]> => {
    const { data, error } = await supabase
      .from("knowledge_bases")
      .select("*")
      .eq("is_deleted", true)
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * 恢复知识库（从归档状态恢复）
   */
  restore: async (id: string): Promise<KnowledgeBase> => {
    const { data, error } = await supabase
      .from("knowledge_bases")
      .update({ is_deleted: false })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * 删除知识库（硬删除）
   */
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from("knowledge_bases").delete().eq("id", id);

    if (error) throw error;
  },
};

// =============================================
// 知识库条目相关 API
// =============================================

export const knowledgeItemsApi = {
  /**
   * 获取知识库的所有条目（扁平结构）
   */
  getByKnowledgeBaseId: async (knowledgeBaseId: string): Promise<KnowledgeItem[]> => {
    const { data, error } = await supabase
      .from("knowledge_items")
      .select("*")
      .eq("knowledge_base_id", knowledgeBaseId)
      .order("order_index", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * 获取知识库的树形结构
   */
  getTreeByKnowledgeBaseId: async (knowledgeBaseId: string): Promise<KnowledgeItem[]> => {
    const items = await knowledgeItemsApi.getByKnowledgeBaseId(knowledgeBaseId);

    // 构建树形结构
    const buildTree = (parentId: string | null): KnowledgeItem[] => {
      return items
        .filter((item) => item.parent_id === parentId)
        .map((item) => ({
          ...item,
          children: item.type === "folder" ? buildTree(item.id) : undefined,
        }));
    };

    return buildTree(null);
  },

  /**
   * 获取单个条目详情
   */
  getById: async (id: string): Promise<KnowledgeItem> => {
    const { data, error } = await supabase
      .from("knowledge_items")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * 创建知识库条目
   */
  create: async (itemData: CreateKnowledgeItemDto): Promise<KnowledgeItem> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("未登录");

    const { data, error } = await supabase
      .from("knowledge_items")
      .insert({
        user_id: user.id,
        knowledge_base_id: itemData.knowledge_base_id,
        parent_id: itemData.parent_id,
        type: itemData.type,
        name: itemData.name,
        content: itemData.content,
        order_index: itemData.order_index || 0,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * 更新知识库条目
   */
  update: async (itemData: UpdateKnowledgeItemDto): Promise<KnowledgeItem> => {
    const { id, ...updates } = itemData;

    const { data, error } = await supabase
      .from("knowledge_items")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * 删除知识库条目
   */
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from("knowledge_items").delete().eq("id", id);

    if (error) throw error;
  },

  /**
   * 移动条目到新的父文件夹
   */
  move: async (id: string, newParentId: string | null): Promise<KnowledgeItem> => {
    const { data, error } = await supabase
      .from("knowledge_items")
      .update({ parent_id: newParentId })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * 批量更新条目顺序
   */
  updateOrder: async (items: Array<{ id: string; order_index: number }>): Promise<void> => {
    const promises = items.map(({ id, order_index }) =>
      supabase.from("knowledge_items").update({ order_index }).eq("id", id)
    );

    const results = await Promise.all(promises);
    const errors = results.filter((r) => r.error);

    if (errors.length > 0) {
      throw new Error("批量更新条目顺序失败");
    }
  },
};
