---
name: git-commit-messages
description: 按项目 Conventional Commits 与 commitlint 规范生成中文 Git 提交信息。改动文件较多时必须使用「xxx 相关代码提交 + body 列表」格式。在用户要求提交代码、撰写 commit message、或分析 staged diff 时使用。
---

# Git 提交信息（中文）

本仓库通过 `commitlint.config.mjs` 校验提交信息。**提交说明必须使用中文**，并符合 Conventional Commits。

## 格式

```
<type>(<scope>): <subject>

<body>
```

- **type**（必填）：见下方类型表
- **scope**（可选）：模块/目录，如 `editor`、`i18n`、`layout`
- **subject**（必填）：中文简述，**不含句号**，**最多 100 字符**
- **body**：**改动文件较多时必填**，见下方「多文件提交」

## 类型

| type | 用途 |
|------|------|
| `feat` | 新功能 |
| `fix` | 修复 bug |
| `docs` | 文档 |
| `style` | 格式调整，不影响逻辑 |
| `refactor` | 重构 |
| `perf` | 性能优化 |
| `test` | 测试 |
| `build` | 构建/依赖 |
| `ci` | CI 配置 |
| `chore` | 其他杂项 |
| `revert` | 回滚 |

## 多文件提交（重点）

**改动文件较多时，禁止把所有细节塞进 subject 一行。** 必须拆成「概括标题 + body 列表」。

### 何时必须用此格式

满足**任一**条件即必须用：

- 改动文件 **> 3 个**
- 跨 **2 个以上** 目录/子模块（如 `app/` + `store/` + `i18n/`）
- 同一功能涉及 **多个组件 / store / 迁移 / 文案** 等分散改动
- subject 若写全所有变更会 **超过 100 字符** 或变得冗长

### 标准模板

subject 固定用「**{功能/模块}相关代码提交**」概括；body 用 `-` 分条列出主要变更（**3–7 条**，每条一句，按模块或职责分组）：

```
feat(editor): 章节列表顶部操作栏相关代码提交

- 新增顶部操作栏组件
- 调整章节项与卷项布局
- 补充中英文 i18n 文案
```

```
fix(ai): 对话消息持久化相关代码提交

- 修复 tool 部分未写入数据库
- 新增 novel_messages_parts 迁移
- 调整 store 同步逻辑
```

### 多文件时禁止

- 禁止只用一行 subject 罗列所有文件名或改动点
- 禁止 subject 写成「修改 A、B、C、D、E…」
- 禁止省略 body，把 5+ 个文件的 diff 压缩成一句

## 单文件 / 单一改动

**仅当**改动文件 **≤ 3 个** 且 **同一意图、同一模块** 时，才用一行 subject：

```
feat(editor): 章节项支持拖拽排序
fix(i18n): 修复编辑器侧边栏文案缺失
chore: 更新 supabase 迁移脚本
```

## 撰写流程

1. 并行执行：`git status`、`git diff`（含 staged）、`git log -10 --oneline`（对齐近期风格）
2. **先数改动文件数与涉及模块**——文件多 → 直接走「多文件提交」模板
3. 根据 diff 判断 type；跨模块时用 scope 或省略 scope
4. 提交前自检：
   - subject ≤ 100 字符
   - 文件多时 **必须有 body 列表**
   - type 在允许枚举内
   - 中文表述，动词开头，无句号
   - 不包含 `.env`、密钥等敏感文件

## 提交命令

多文件提交**必须**用 HEREDOC 传递完整 message（含空行与列表）：

```bash
git add <files>
git commit -m "$(cat <<'EOF'
feat(editor): 章节列表顶部操作栏相关代码提交

- 新增顶部操作栏组件
- 调整章节项布局
- 补充 i18n 文案
EOF
)"
```

## 禁止

- 未经用户明确要求，不要执行 commit / push
- 不要使用英文 subject
- 不要超出 subject 100 字符限制
- 文件多时不要用单行 commit message
- 不要用 `git commit --amend`，除非用户明确要求且 HEAD 未 push
- 不要跳过 hooks（`--no-verify`）

## 示例（对照仓库历史）

**多文件（推荐写法）：**

```
feat: 章节列表顶部操作栏相关代码提交

- 新增 chapter-header 组件
- 调整 volume-item 章节统计位置
- 更新 editor i18n 文案
```

**单文件 / 小改动：**

```
feat(layout): 添加 sidebar 宽度持久化到 localStorage，优化主布局
fix: 关系卡片生成后配色不匹配
chore: 完善数据库 cli，修复消息 tool 部分未持久化问题
refactor: 优化对话输出
```
