import { app, BrowserWindow } from "electron";
import { initIPCHandlers } from "./core/js/ipcHandlers.js";
import { join } from "path";
import "./db/ipcDatabase.js"
import dotenv from "dotenv"
dotenv.config()


const pages = join(__dirname, "pages");

async function createWindow() {
  const win = new BrowserWindow({
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
  
  win.loadFile(join(pages, "index.html"));
  win.removeMenu();
  // win.webContents.openDevTools()
  initIPCHandlers()
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
