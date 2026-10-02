import { join } from "node:path";

import { app, BrowserWindow, dialog, shell } from "electron";

import { serveRenderer } from "./server";

import icon from "../../resources/icon.png?asset";

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    icon,
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: true,
    },
  });

  mainWindow.webContents.on("will-navigate", (event, url) => {
    const origin = new URL(process.env.ELECTRON_RENDERER_URL ?? "http://localhost:47831").origin;
    if (new URL(url).origin !== origin) {
      event.preventDefault();
      if (/^https?:\/\//.test(url)) void shell.openExternal(url);
    }
  });

  mainWindow.on("ready-to-show", () => mainWindow.show());

  // 外部链接交给系统浏览器，不在应用内开新窗口。
  mainWindow.webContents.setWindowOpenHandler((details) => {
    if (/^https?:\/\//.test(details.url)) void shell.openExternal(details.url);
    return { action: "deny" };
  });

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    mainWindow.loadURL("http://localhost:47831");
  }
}

if (!app.requestSingleInstanceLock()) app.quit();
else
  void app.whenReady().then(async () => {
    if (!process.env.ELECTRON_RENDERER_URL) {
      try {
        const server = await serveRenderer(join(__dirname, "../renderer"));
        app.on("will-quit", () => server.close());
      } catch (error) {
        dialog.showErrorBox("Narraverse", error instanceof Error ? error.message : String(error));
        app.quit();
        return;
      }
    }
    createWindow();

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

// darwin 下关闭窗口不退出进程，符合桌面端惯例。
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("second-instance", () => {
  const window = BrowserWindow.getAllWindows()[0];
  if (window) {
    if (window.isMinimized()) window.restore();
    window.show();
    window.focus();
  }
});
