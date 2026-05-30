# Supabase CLI 工作区

这个目录由 Supabase CLI 管理。

- `config.toml` — 项目配置（提交）
- `migrations/` — 时间戳命名的 SQL 迁移（提交）
- `seed.sql` — 可选；本地启动时填充种子数据（提交）
- `.temp/`、`.branches/`、`logs/` — CLI 缓存（不提交，已 .gitignore）

**完整工作流和命令说明请看 [`../docs/supabase-migrations.md`](../docs/supabase-migrations.md)。**
