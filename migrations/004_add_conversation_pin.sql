-- =====================================================
-- 为 conversations 表添加置顶功能
-- =====================================================
-- 添加置顶相关字段
-- 
-- 使用方法：
-- 在 Supabase Dashboard 的 SQL Editor 中执行此脚本
-- =====================================================

-- 添加置顶字段
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS pinned_at TIMESTAMP WITH TIME ZONE;

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS conversations_is_pinned_idx ON conversations(is_pinned, updated_at DESC);

-- 添加注释
COMMENT ON COLUMN conversations.is_pinned IS '是否置顶';
COMMENT ON COLUMN conversations.pinned_at IS '置顶时间';

