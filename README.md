<div align="center">

# Narraverse - 小说创作平台

</div>

## 核心目标

我们专注为才华横溢的创作者打造舒适的创作环境，降低优质内容被看见、被发掘、被分享的门槛。

同时也为新手提供AI辅助，降低直面感受创作、学习创作、走进创作的门槛。

## 开发模式

环境变量配置

```bash
# SUPABASE 配置
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# 硅基流动 AI 配置
SILICON_FLOW_API_KEY=
SILICON_FLOW_BASE_URL=
SILICON_FLOW_MODEL=
```

代码格式化配置

新建 .vscode/settings.json

```json
{
  // 编辑器基础配置
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "editor.detectIndentation": false,

  // 文件配置
  "files.eol": "\n",
  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true,

  // TypeScript/JavaScript 特定配置
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[jsonc]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },

  // ESLint 配置
  "eslint.enable": true,
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],

  // Prettier 配置
  "prettier.enable": true,
  "prettier.requireConfig": true,

  // 其他推荐配置
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```
