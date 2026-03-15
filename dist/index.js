"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const ipcHandlers_js_1 = require("./core/js/ipcHandlers.js");
const path_1 = require("path");
require("./db/ipcDatabase.js");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const pages = (0, path_1.join)(__dirname, "pages");
let mainWindow = null;
let tray = null;
function setTrayTooltip(text) {
    tray === null || tray === void 0 ? void 0 : tray.setToolTip(text);
}
function showWindow() {
    if (!mainWindow || mainWindow.isDestroyed())
        return;
    mainWindow.show();
    if (mainWindow.isMinimized())
        mainWindow.restore();
    mainWindow.focus();
}
function hideWindowToTray() {
    if (!mainWindow || mainWindow.isDestroyed())
        return;
    mainWindow.hide();
}
function ensureTray() {
    if (tray)
        return tray;
    tray = new electron_1.Tray((0, path_1.join)(__dirname, "core", "imgs", "icons", "icon.ico"));
    setTrayTooltip("BRLauncher");
    tray.setContextMenu(electron_1.Menu.buildFromTemplate([
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
                electron_1.app.quit();
            },
        },
    ]));
    tray.on("click", () => showWindow());
    tray.on("double-click", () => showWindow());
    return tray;
}
function createWindow() {
    return __awaiter(this, void 0, void 0, function* () {
        mainWindow = new electron_1.BrowserWindow({
            minWidth: 1200,
            minHeight: 700,
            titleBarStyle: "hidden",
            icon: (0, path_1.join)(__dirname, 'core', 'imgs', 'icons', 'icon.ico'),
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: true,
                preload: (0, path_1.join)(__dirname, 'core', "app.js"),
            },
        });
        mainWindow.loadFile((0, path_1.join)(pages, "index.html"));
        mainWindow.removeMenu();
        // mainWindow.webContents.openDevTools()
        (0, ipcHandlers_js_1.initIPCHandlers)(mainWindow, {
            onStartPlaying: () => setTrayTooltip("BRLauncher - Jogando Minecraft"),
            onStopPlaying: () => setTrayTooltip("BRLauncher"),
        });
        ensureTray();
        electron_1.ipcMain.handle("hideToTray", () => {
            hideWindowToTray();
            return true;
        });
        electron_1.ipcMain.handle("restoreFromTray", () => {
            showWindow();
            return true;
        });
        mainWindow.on("closed", () => {
            mainWindow = null;
        });
    });
}
electron_1.app.whenReady().then(() => {
    if (process.platform === "win32") {
        electron_1.app.setAppUserModelId("BRLauncher");
    }
    createWindow();
    electron_1.app.on("activate", () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
