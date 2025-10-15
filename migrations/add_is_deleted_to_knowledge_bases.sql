-- 为 knowledge_bases 表添加 is_deleted 字段以支持软删除
ALTER TABLE knowledge_bases
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;

-- 为 is_deleted 字段创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_knowledge_bases_is_deleted ON knowledge_bases(is_deleted);

-- 添加注释说明
COMMENT ON COLUMN knowledge_bases.is_deleted IS '软删除标记，true 表示已删除（在回收站中）';

