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
Object.defineProperty(exports, "__esModule", { value: true });
exports.initIPCHandlers = void 0;
const electron_1 = require("electron");
const discordStatus_js_1 = require("./discordStatus.js");
const minecraft_java_core_1 = require("minecraft-java-core");
const node_fs_1 = require("node:fs");
const discord = new discordStatus_js_1.DiscordStatusManager();
const initIPCHandlers = (mainWindow, options = {}) => {
    electron_1.ipcMain.handle("minimize", (event) => { var _a, _b; return (_b = ((_a = electron_1.BrowserWindow.getFocusedWindow()) !== null && _a !== void 0 ? _a : mainWindow)) === null || _b === void 0 ? void 0 : _b.minimize(); });
    electron_1.ipcMain.handle("close", (event) => { var _a, _b; return (_b = ((_a = electron_1.BrowserWindow.getFocusedWindow()) !== null && _a !== void 0 ? _a : mainWindow)) === null || _b === void 0 ? void 0 : _b.close(); });
    electron_1.ipcMain.handle("maxmize", (event) => {
        var _a, _b, _c, _d, _e, _f;
        return !((_b = ((_a = electron_1.BrowserWindow.getFocusedWindow()) !== null && _a !== void 0 ? _a : mainWindow)) === null || _b === void 0 ? void 0 : _b.isMaximized())
            ? (_d = ((_c = electron_1.BrowserWindow.getFocusedWindow()) !== null && _c !== void 0 ? _c : mainWindow)) === null || _d === void 0 ? void 0 : _d.maximize()
            : (_f = ((_e = electron_1.BrowserWindow.getFocusedWindow()) !== null && _e !== void 0 ? _e : mainWindow)) === null || _f === void 0 ? void 0 : _f.unmaximize();
    });
    electron_1.ipcMain.handle("stopPlaying", () => {
        var _a;
        (_a = options.onStopPlaying) === null || _a === void 0 ? void 0 : _a.call(options);
        return discord.setStatusPage('Acabou de fechar o Minecraft');
    });
    electron_1.ipcMain.handle("changedPage", (event, page) => discord.setStatusPage(page));
    electron_1.ipcMain.handle("playing", (event, version) => {
        var _a;
        (_a = options.onStartPlaying) === null || _a === void 0 ? void 0 : _a.call(options, version);
        return discord.setPlaying(version);
    });
    electron_1.ipcMain.handle('fileExplorer', (event) => {
        const path = electron_1.dialog.showOpenDialogSync({
            properties: ['openDirectory']
        });
        return path;
    });
    electron_1.ipcMain.handle('getInstances', (event, instancesPath) => {
        try {
            const instances = (0, node_fs_1.readdirSync)(instancesPath);
            return instances;
        }
        catch (error) {
            console.error("Erro ao ler pastas de perfis:", error);
            return [];
        }
    });
    electron_1.ipcMain.handle('delete-instance-folder', (event, path) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            (0, node_fs_1.rmSync)(path, { recursive: true, force: true });
            return true;
        }
        catch (error) {
            console.error("Erro ao deletar pasta do perfil:", error);
            return false;
        }
    }));
    electron_1.ipcMain.handle('create-instance-folder', (event, path) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            (0, node_fs_1.mkdirSync)(path, { recursive: true });
            return path;
        }
        catch (error) {
            console.error("Erro ao criar pasta do perfil:", error);
            return false;
        }
    }));
    electron_1.ipcMain.handle('openDevtools', () => { var _a; return (_a = electron_1.BrowserWindow.getFocusedWindow()) === null || _a === void 0 ? void 0 : _a.webContents.openDevTools(); });
    electron_1.ipcMain.handle('loginMicrosoft', (event, clientId) => __awaiter(void 0, void 0, void 0, function* () {
        const microsoft = new minecraft_java_core_1.Microsoft(clientId);
        const auth = yield microsoft.getAuth();
        return auth;
    }));
};
exports.initIPCHandlers = initIPCHandlers;
