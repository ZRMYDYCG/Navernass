<div align="center">

<img src="./resources/icon.png" alt="Narraverse" width="96" />

# @narraverse/desktop

Narraverse 桌面端 · Electron + React + TypeScript（electron-vite）

</div>

## 开发

```bash
pnpm dev:desktop         # 启动开发窗口（renderer HMR + 主进程热重启）
pnpm build:desktop       # 产出 out/（main / preload / renderer）
pnpm typecheck:desktop   # tsconfig.node + tsconfig.web 双重类型检查
```

## 结构

```
src/
├── main/       主进程：窗口创建、生命周期、系统交互
├── preload/    contextBridge 暴露给渲染进程的 API（含全局类型声明）
└── renderer/   React 界面（index.html + src/）
resources/      应用图标
```

## 约定

- 外部链接一律交给系统浏览器打开（`setWindowOpenHandler` 中处理）。
- 渲染进程通过 `window.api` 访问 preload 暴露的能力，类型见 `src/preload/index.d.ts`。
- lint / format / typecheck:all 根门禁已覆盖本目录。
