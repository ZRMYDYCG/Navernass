# Narraverse Desktop

桌面端内置了一份从前端迁移过来的 Agent、工作区、编辑器、设置、翻译和样式代码。无需启动 Next.js，启动后默认进入 Agent 模式。侧边栏底部提供登录、注册与退出登录入口。

## 开发

```sh
pnpm dev:backend
pnpm dev:desktop
```

默认连接 `http://localhost:3001`。使用其他后端时，通过 `DESKTOP_BACKEND_URL` 指定地址；开发和生产运行都支持此环境变量。

## 生产构建与预览

```sh
pnpm build:desktop
pnpm --filter @narraverse/desktop start
```

构建产物位于 `apps/desktop/out`，目前未配置安装包发布流程。

桌面页面固定使用本机 `http://localhost:47831`，开发与生产预览不能同时占用这个端口。生产运行只监听本机，静态页面和 `/api` 代理同源，登录 Cookie 由 Electron 保存，Agent 响应直接流式转发。退出登录会清除当前账号的查询缓存和作品选择。

前端业务代码位于 `src/renderer/frontend`；桌面端仅适配导航、Provider 和账号入口。语言选择与主题保存在本机，默认语言为简体中文。
