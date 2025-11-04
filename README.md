<div align="center">

<img src="./public/assets/svg/logo-dark.svg" alt="Narraverse Logo" width="120" />

# Narraverse - 小说创作平台

</div>

## 核心目标

我们专注为才华横溢的创作者打造舒适的创作环境，降低优质内容被看见、被分享、被发掘的门槛。

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
  // Disable the default formatter, use eslint instead
  "prettier.enable": false,
  "editor.formatOnSave": false,

  // Auto fix
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "never"
  },

  // Silent the stylistic rules in you IDE, but still auto fix them
  "eslint.rules.customizations": [
    { "rule": "style/*", "severity": "off", "fixable": true },
    { "rule": "format/*", "severity": "off", "fixable": true },
    { "rule": "*-indent", "severity": "off", "fixable": true },
    { "rule": "*-spacing", "severity": "off", "fixable": true },
    { "rule": "*-spaces", "severity": "off", "fixable": true },
    { "rule": "*-order", "severity": "off", "fixable": true },
    { "rule": "*-dangle", "severity": "off", "fixable": true },
    { "rule": "*-newline", "severity": "off", "fixable": true },
    { "rule": "*quotes", "severity": "off", "fixable": true },
    { "rule": "*semi", "severity": "off", "fixable": true }
  ],

  // Enable eslint for all supported languages
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact",
    "vue",
    "html",
    "markdown",
    "json",
    "jsonc",
    "yaml",
    "toml",
    "xml",
    "gql",
    "graphql",
    "astro",
    "svelte",
    "css",
    "less",
    "scss",
    "pcss",
    "postcss"
  ]
}
```

## 开发规范工具链

Git Hooks 管理

lefthook

代码质量检查

eslint @antfu/eslint-config eslint-plugin-tailwindcss

Commit 规范

@commitlint/cli @commitlint/config-conventional

commitizen cz-git

暂存区代码检查

lint-staged

版本发布自动化

release-it @release-it/conventional-changelog
