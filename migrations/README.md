# 数据库迁移说明

## 回收站功能迁移

为了支持回收站功能，需要为 `knowledge_bases` 表添加 `is_deleted` 字段。

### 如何运行迁移

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 点击左侧菜单的 "SQL Editor"
4. 点击 "New query"
5. 复制 `add_is_deleted_to_knowledge_bases.sql` 文件的内容并粘贴到编辑器中
6. 点击 "Run" 按钮执行 SQL

### 迁移内容

- 为 `knowledge_bases` 表添加 `is_deleted` 字段（布尔类型，默认值为 `false`）
- 创建索引以提高查询性能
- 添加字段注释说明

### 回收站功能说明

- **小说**：已支持，使用 `status` 字段的 `archived` 状态
- **知识库**：需要运行此迁移，添加 `is_deleted` 字段

迁移完成后，回收站页面将能够：

- 显示已删除的小说和知识库
- 右键菜单支持恢复和永久删除操作
- 按删除时间排序显示
