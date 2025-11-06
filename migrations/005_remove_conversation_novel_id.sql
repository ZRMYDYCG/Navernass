-- =====================================================
-- 移除 conversations 表的 novel_id 字段
-- =====================================================
-- conversations 表不再需要与 novels 表关联
-- 聊天功能现在是独立的
-- 
-- 使用方法：
-- 在 Supabase Dashboard 的 SQL Editor 中执行此脚本
-- =====================================================

-- 删除索引
DROP INDEX IF EXISTS conversations_novel_id_idx;

-- 删除外键约束并移除 novel_id 字段
ALTER TABLE conversations 
DROP COLUMN IF EXISTS novel_id;

-- 更新注释
COMMENT ON TABLE conversations IS 'AI对话表（独立功能，不关联小说）';

