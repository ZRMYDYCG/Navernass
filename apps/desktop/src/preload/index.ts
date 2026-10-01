import { contextBridge } from "electron";

const api = {
  platform: process.platform,
};

contextBridge.exposeInMainWorld("api", api);

export type Api = typeof api;
