import type { KnowledgeItem as ApiKnowledgeItem } from "@/lib/api";

// 本地数据结构（用于树形展示）
export interface KnowledgeItem {
  id: string;
  name: string;
  type: "folder" | "file";
  children?: KnowledgeItem[];
  updatedAt?: string;
  content?: string;
}

// 将 API 返回的数据转换为树形结构
export function buildTree(items: ApiKnowledgeItem[] | undefined): KnowledgeItem[] {
  if (!items || !Array.isArray(items)) {
    return [];
  }

  const itemMap = new Map<string, KnowledgeItem>();
  const roots: KnowledgeItem[] = [];

  // 第一遍：创建所有节点
  items.forEach((item: ApiKnowledgeItem) => {
    itemMap.set(item.id, {
      id: item.id,
      name: item.name,
      type: item.type,
      children: [],
      updatedAt: new Date(item.updated_at).toLocaleDateString(),
      content: item.content,
    });
  });

  // 第二遍：建立父子关系
  items.forEach((item: ApiKnowledgeItem) => {
    const node = itemMap.get(item.id)!;
    if (item.parent_id) {
      const parent = itemMap.get(item.parent_id);
      if (parent) {
        if (!parent.children) parent.children = [];
        parent.children.push(node);
      }
    } else {
      roots.push(node);
    }
  });

  return roots;
}
