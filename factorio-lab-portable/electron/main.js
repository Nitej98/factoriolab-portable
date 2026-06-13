const { app, BrowserWindow, ipcMain, screen, shell } = require("electron");
const path = require("path");
const fs = require("fs");
const { getSpriteDetails } = require("./decode");
const { protocol } = require("electron");
const { customProtocolHandler } = require("./custom_protocol_handler");
const { autoUpdater } = require("electron-updater");

// enable packaged mode for testing
// if (!app.isPackaged) {
//   Object.defineProperty(app, "isPackaged", {
//     get() {
//       return true;
//     },
//   });
// }

const saveFileName = app.isPackaged ? "tabs_data.json" : "tabs_data_dev.json";
const settingsFileName = app.isPackaged ? "settings.json" : "settings_dev.json";
const tabsFile = path.join(app.getPath("userData"), saveFileName);
const settingsFile = path.join(app.getPath("userData"), settingsFileName);
let mainWindow;

// updater config
autoUpdater.setFeedURL({
  provider: "github",
  owner: "Nitej98",
  repo: "factoriolab-portable",
});
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = false;

// main window

function createWindow() {
  const { width: realWidth, height: realHeight } =
    screen.getPrimaryDisplay().size;
  const windowWidth = Math.floor((realWidth * 2) / 3);
  const windowHeight = Math.floor((realHeight * 2) / 3);

  mainWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    icon: path.join(
      __dirname,
      "../build/assets",
      "title_bar_icons",
      "title_bar_icon.png",
    ),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      disableBlinkFeatures: "WebContents.forceDisabledCache",
      webviewTag: true,
    },
  });

  // Loading app

  const startUrl = app.isPackaged
    ? `file://${path.join(__dirname, "../build/index.html")}`
    : "http://localhost:3000";

  // const startUrl = "http://localhost:3000";

  // const startUrl = `file://${path.join(__dirname, "../build/index.html")}`;

  mainWindow.loadURL(startUrl);

  // open dev tools
  // mainWindow.webContents.openDevTools();

  // Disable keyboard shortcuts
  if (app.isPackaged) {
    // disable shortcuts when react in focus
    mainWindow.webContents.on("before-input-event", (event, input) => {
      blockShortcuts(event, input);
    });
    // disable shortcuts when webview in focus
    app.on("web-contents-created", (event, contents) => {
      if (contents.getType() === "webview") {
        contents.on("before-input-event", (event, input) => {
          blockShortcuts(event, input);
        });
      }
    });
  }
  const blockShortcuts = (event, input) => {
    const isReload = input.key.toLowerCase() === "r" && input.control;
    const isDevTools =
      input.key.toLowerCase() === "i" && input.control && input.shift;
    const close = input.key.toLowerCase() === "w" && input.control;
    if (isReload || isDevTools || close) {
      event.preventDefault();
    }
  };

  // open social links in external browser
  app.on("web-contents-created", (event, contents) => {
    if (contents.getType() === "webview") {
      contents.setWindowOpenHandler((details) => {
        const url = new URL(details.url);
        // lets factoriolab open a new tab
        if (url.protocol === "app:") {
          mainWindow.webContents.send("add-new-tab", url.href);
          return { action: "deny" };
        }
        console.log(url.hostname);
        try {
          shell.openExternal(
            {
              "github.com": "https://github.com/Nitej98/factoriolab-portable",
            }[url.hostname],
          );
        } catch (e) {
          console.log(e);
        }

        return { action: "deny" };
      });
    }
  });

  // get app version
  ipcMain.handle("get-app-version", () => app.getVersion());

  // updater IPC handlers
  ipcMain.handle("check-for-update", () => {
    autoUpdater.checkForUpdates();
  });

  ipcMain.handle("start-download-update", () => {
    autoUpdater.downloadUpdate();
  });

  ipcMain.handle("install-update", () => {
    autoUpdater.quitAndInstall();
  });

  // Titlebar events

  mainWindow.on("maximize", () => {
    mainWindow.webContents.send("window:isMaximized");
  });

  mainWindow.on("unmaximize", () => {
    mainWindow.webContents.send("window:isUnmaximized");
  });
}

// IPC handlers
ipcMain.on("window:minimize", () => mainWindow.minimize());
ipcMain.on("window:maximize", () => mainWindow.maximize());
ipcMain.on("window:unmaximize", () => mainWindow.unmaximize());
ipcMain.on("window:close", () => mainWindow.close());
ipcMain.on("window:toggleMaximize", () => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});

// handle url decode
ipcMain.handle("decode", async (event, url) => {
  return await getSpriteDetails(url);
});

// save tab data to json
ipcMain.handle("save-tabs", async (event, { tabs, activeTabId }) => {
  console.log("saved data");
  const tabsToSave = tabs.map((tab) => ({
    ...tab,
    src: tab.url,
  }));
  const saveData = {
    tabs: tabsToSave,
    activeTabId,
  };
  try {
    fs.writeFileSync(tabsFile, JSON.stringify(saveData, null, 2), "utf-8");
    return { success: true };
  } catch (err) {
    console.error("Failed to save tabs:", err);
    return { success: false, error: err.message };
  }
});

// retrieve tab data from json
ipcMain.handle("load-tabs", async () => {
  console.log("loaded data");
  try {
    if (!fs.existsSync(tabsFile)) return { tabs: [], activeTabId: null };
    const data = JSON.parse(fs.readFileSync(tabsFile, "utf-8"));
    return { tabs: data.tabs ?? [], activeTabId: data.activeTabId ?? null };
  } catch (err) {
    console.error("Failed to load tabs:", err);
    return { tabs: [], activeTabId: null };
  }
});

// save settings to json
ipcMain.handle("save-settings", async (event, newSettings) => {
  try {
    let existing = {};
    if (fs.existsSync(settingsFile)) {
      try {
        existing = JSON.parse(fs.readFileSync(settingsFile, "utf-8"));
      } catch (err) {
        console.warn("Settings file corrupted, resetting.");
      }
    }
    const merged = { ...existing, ...newSettings };
    fs.writeFileSync(settingsFile, JSON.stringify(merged, null, 2), "utf-8");
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// load settings from json
ipcMain.handle("load-settings", async () => {
  try {
    if (!fs.existsSync(settingsFile)) return {};
    const data = fs.readFileSync(settingsFile, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    return {};
  }
});

// custom protocol handler

protocol.registerSchemesAsPrivileged([
  {
    scheme: "app",
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true,
      allowServiceWorkers: false,
      bypassCSP: false,
    },
  },
]);

// open devtools for webview(reloading the webview with devtools on is prone to crashing)

// app.on("web-contents-created", (event, contents) => {
//   if (contents.getType() === "webview") {
//     contents.openDevTools();
//   }
// });

app.whenReady().then(() => {
  setupAutoUpdater();
  protocol.handle("app", async (request) => {
    const result = await customProtocolHandler(request.url);
    return new Response(result.buffer, {
      headers: {
        "Content-Type": result.mime,
        "Cache-Control": "no-store",
      },
    });
  });
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

function setupAutoUpdater() {
  autoUpdater.on("error", (err) => {
    console.error("Update error:", err);
    mainWindow.webContents.send("update-status", {
      status: "error",
      message: err.message,
    });
  });

  autoUpdater.on("checking-for-update", () => {
    mainWindow.webContents.send("update-status", { status: "checking" });
  });

  autoUpdater.on("update-available", (info) => {
    mainWindow.webContents.send("update-status", {
      status: "available",
      version: info.version,
    });
  });

  autoUpdater.on("update-not-available", () => {
    mainWindow.webContents.send("update-status", { status: "not-available" });
  });

  autoUpdater.on("download-progress", (progressObj) => {
    mainWindow.webContents.send("update-status", {
      status: "downloading",
      progress: progressObj.percent,
    });
  });

  autoUpdater.on("update-downloaded", (info) => {
    mainWindow.webContents.send("update-status", {
      status: "downloaded",
      version: info.version,
    });
  });
}
