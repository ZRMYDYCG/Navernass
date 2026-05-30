# Supabase 迁移基建

> 本文档说明本项目如何用 Supabase CLI 在本地用 SQL 文件管理远程数据库 schema。

## 目录布局

```
supabase/
├── config.toml          项目配置（提交到 git）
├── migrations/          时间戳命名的 SQL 迁移（提交）
│   └── 20260530000000_add_conversation_summary.sql
├── seed.sql             可选；本地 supabase start 时填充的种子数据
├── .gitignore           忽略 .temp / .branches / logs
└── README.md

migrations/              历史遗留：从 web console 复制下来的 schema dump，仅供参考
└── init_database.sql    （文件首行就标注 "is for context only"，不要 run）
```

## 一次性初始化（每个开发者）

### 1. 安装 Supabase CLI

由于网络问题或 npm registry 不通，**首选用本地安装到项目 devDependency**：

```powershell
pnpm add -D supabase
```

如果 npm registry 不通（`ECONNRESET`、`UND_ERR_CONNECT_TIMEOUT`）：

- 切到淘宝镜像：`pnpm config set registry https://registry.npmmirror.com`
- 或直接下载二进制：从 <https://github.com/supabase/cli/releases> 下载 Windows zip，解压后把 `supabase.exe` 放进 PATH
- 或用 scoop：`scoop bucket add supabase https://github.com/supabase/scoop-bucket.git && scoop install supabase`

验证：

```powershell
pnpm exec supabase --version    # devDependency 形式
# 或
supabase --version              # 全局形式
```

后续命令本文档统一写 `pnpm exec supabase ...`，全局安装的同学省略 `pnpm exec` 即可。

### 2. 登录 Supabase

```powershell
pnpm exec supabase login
```

浏览器会打开授权页，回到终端按提示粘贴 access token。token 会写入 `%USERPROFILE%\.supabase\access-token`，**不在仓库里**。

也可以设置环境变量 `SUPABASE_ACCESS_TOKEN=sbp_xxx` 跳过 login。

### 3. 链接到远程项目

项目 ref 是 supabase URL 的子域：`https://vdkyjmlalrspsebjhkya.supabase.co` → ref 是 `vdkyjmlalrspsebjhkya`。

设置环境变量后用 npm script 链接：

```powershell
$env:SUPABASE_PROJECT_REF = "vdkyjmlalrspsebjhkya"
pnpm db:link
```

或直接：

```powershell
pnpm exec supabase link --project-ref vdkyjmlalrspsebjhkya
```

会提示输入数据库密码（在 supabase web console → Project Settings → Database 找）。密码存在系统钥匙串，**不写文件**。

### 4. 把已有的 schema 标记为 "已应用"

仓库的 `supabase/migrations/20260530000000_add_conversation_summary.sql` 在远程**可能已经手动跑过了**（在 Memory Agent 预留位那一轮）。

为避免 `db push` 时再跑一遍报错，先比对一下：

```powershell
pnpm db:migration:list
```

如果输出显示 `20260530000000` 的 Local 列有但 Remote 没有，且你**确认远程已经有 summary 列**了，把它标记为已应用：

```powershell
pnpm db:migration:repair 20260530000000
```

如果远程**还没有** summary 列，直接：

```powershell
pnpm db:push
```

会把这条迁移真正应用到远程。

## 日常工作流

### 改 schema

1. 起一个新 migration（CLI 会自动生成时间戳前缀）：

```powershell
pnpm db:migration:new add_chapter_tags
# → 生成 supabase/migrations/<utc-ts>_add_chapter_tags.sql（空文件）
```

2. 在新文件里写 SQL（**幂等**：用 `IF NOT EXISTS` / `IF EXISTS`）：

```sql
ALTER TABLE public.chapters
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';
```

3. 推到远程：

```powershell
pnpm db:push
```

CLI 会读取远程 `supabase_migrations.schema_migrations` 表，只跑没记录过的版本。**幂等且按时间戳顺序应用**。

`--dry-run` 可以预览：

```powershell
pnpm exec supabase db push --dry-run
```

### 远程被人手改了 → 拉回本地

```powershell
pnpm db:pull
# 自动生成一个新的 timestamped 迁移，捕捉远程当前状态
```

### 生成 TypeScript 类型

```powershell
pnpm db:types
# → 写入 lib/supabase/database.types.ts
```

可以替换或对照 `lib/supabase/sdk/types.ts` 里手维护的类型定义。

### 完整命令一览

| script | 作用 |
|---|---|
| `pnpm db:link` | 链接本地仓库到远程项目（一次性） |
| `pnpm db:push` | 把本地未应用的迁移按顺序推到远程 |
| `pnpm db:pull` | 用远程当前 schema 生成一个新迁移（兜底同步） |
| `pnpm db:diff <name>` | 对比本地与远程，差异写为新迁移文件 |
| `pnpm db:migration:new <name>` | 创建空迁移文件 |
| `pnpm db:migration:list` | 列出本地 vs 远程已应用版本 |
| `pnpm db:migration:repair <ver>` | 标记某版本为"已应用"，不实际跑 SQL |
| `pnpm db:types` | 生成 TypeScript 类型定义到 `lib/supabase/database.types.ts` |
| `pnpm db:reset` | **危险**：重置远程 DB 重跑所有迁移 |

## 不需要 Docker

- `db push` / `db pull` / `db diff --linked` / `db migration list` 都直接打远程，**不要 Docker**
- `supabase start` 启动本地完整栈才需要 Docker（本项目暂不需要本地栈）
- `db diff` 默认用本地 shadow DB（要 Docker），加 `--linked` 直接和远程比就不要 Docker

## 常见问题

### CLI 装不上 / 网络超时连接 supabase.co

中国大陆网络对 `supabase.co` 不稳定。建议方案：

1. 全程开 VPN/代理，包括 npm install 和 supabase CLI 调用
2. 或在云上（一台海外 VPS / GitHub Actions）做迁移管理，本地只写 SQL 文件提交到 git
3. **不要**在 web console 直接改 schema，否则本地迁移会和远程脱节

### "remote migration history does not match local files"

通常是远程 schema 被手改、或者别的开发者没把迁移 push 上来。处理：

```powershell
pnpm db:migration:list           # 看哪条不对
pnpm db:pull                     # 把远程当前状态拉成新迁移
# 检查生成的迁移内容是否合理
git diff supabase/migrations/    # 决定保留还是丢弃
```

### 多人协作冲突

时间戳前缀基本能避免文件名冲突；如果两个人**同分钟**起的 migration 撞上了，谁后 push 谁手动改一下时间戳前缀重命名即可。
