import { app, BrowserWindow, ipcMain, Menu, Tray } from "electron";
import { initIPCHandlers } from "./core/js/ipcHandlers.js";
import { join } from "path";
import "./db/ipcDatabase.js"
import dotenv from "dotenv"
dotenv.config()


const pages = join(__dirname, "pages");
let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

function setTrayTooltip(text: string) {
  tray?.setToolTip(text);
}

function showWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.show();
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.focus();
}

function hideWindowToTray() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.hide();
}

function ensureTray() {
  if (tray) return tray;

  tray = new Tray(join(__dirname, "core", "imgs", "icons", "icon.ico"));
  setTrayTooltip("BRLauncher");
  tray.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: "Abrir launcher",
        click: () => {
          showWindow();
        },
      },
      {
        type: "separator",
      },
      {
        label: "Fechar",
        click: () => {
          app.quit();
        },
      },
    ])
  );

  tray.on("click", () => showWindow());
  tray.on("double-click", () => showWindow());

  return tray;
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    minWidth: 1200,
    minHeight: 700,
    titleBarStyle: "hidden",
    icon: join(__dirname, 'core', 'imgs', 'icons', 'icon.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: join(__dirname, 'core', "app.js"),
    },
  });
  
  mainWindow.loadFile(join(pages, "index.html"));
  mainWindow.removeMenu();
  // mainWindow.webContents.openDevTools()
  initIPCHandlers(mainWindow, {
    onStartPlaying: () => setTrayTooltip("BRLauncher - Jogando Minecraft"),
    onStopPlaying: () => setTrayTooltip("BRLauncher"),
  })

  ensureTray();

  ipcMain.handle("hideToTray", () => {
    hideWindowToTray();
    return true;
  });

  ipcMain.handle("restoreFromTray", () => {
    showWindow();
    return true;
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  if (process.platform === "win32") {
    app.setAppUserModelId("BRLauncher");
  }
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
