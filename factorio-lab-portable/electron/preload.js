const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  minimize: () => ipcRenderer.send("window:minimize"),
  maximize: () => ipcRenderer.send("window:maximize"),
  unmaximize: () => ipcRenderer.send("window:unmaximize"),
  close: () => ipcRenderer.send("window:close"),
  onMaximized: (callback) => ipcRenderer.on("window:isMaximized", callback),
  onUnmaximized: (callback) => ipcRenderer.on("window:isUnmaximized", callback),
  toggleMaximize: () => ipcRenderer.send("window:toggleMaximize"),

  // decode url
  decode: (url) => ipcRenderer.invoke("decode", url),

  // save and load tabs
  saveTabs: (data) => ipcRenderer.invoke("save-tabs", data),
  loadTabs: () => ipcRenderer.invoke("load-tabs"),

  // save and load settings
  saveSettings: (settings) => ipcRenderer.invoke("save-settings", settings),
  loadSettings: () => ipcRenderer.invoke("load-settings"),

  // get app version
  getAppVersion: () => ipcRenderer.invoke("get-app-version"),

  // create new tab
  createNewTab: (callback) =>
    ipcRenderer.on("add-new-tab", (event, url) => callback(url)),

  //updater related methods
  checkForUpdate: () => ipcRenderer.invoke("check-for-update"),
  startDownloadUpdate: () => ipcRenderer.invoke("start-download-update"),
  onUpdateStatus: (callback) => ipcRenderer.on("update-status", callback),
  installUpdate: () => ipcRenderer.invoke("install-update"),
  removeUpdateStatusListener: () =>
    ipcRenderer.removeAllListeners("update-status"),
});
