"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electron", {
  onUpdateAvailable: (callback) => electron.ipcRenderer.on("update-available", callback),
  onUpdateDownloaded: (callback) => electron.ipcRenderer.on("update-downloaded", callback),
  restartApp: () => electron.ipcRenderer.send("restart-app")
});
