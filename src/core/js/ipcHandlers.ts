import { ipcMain, BrowserWindow, dialog } from "electron";
import { DiscordStatusManager } from "./discordStatus.js";
import { Microsoft } from "minecraft-java-core";
import { rmdirSync, mkdirSync, rm, readdirSync, rmSync } from "node:fs";

const discord = new DiscordStatusManager()

type InitIPCHandlersOptions = {
    onStartPlaying?: (version: string) => void
    onStopPlaying?: () => void
}

const initIPCHandlers = (mainWindow: BrowserWindow, options: InitIPCHandlersOptions = {}) => {
    ipcMain.handle("minimize", (event) =>
        (BrowserWindow.getFocusedWindow() ?? mainWindow)?.minimize()
    )
    ipcMain.handle("close", (event) => (BrowserWindow.getFocusedWindow() ?? mainWindow)?.close());
    ipcMain.handle("maxmize", (event) =>
        !(BrowserWindow.getFocusedWindow() ?? mainWindow)?.isMaximized()
            ? (BrowserWindow.getFocusedWindow() ?? mainWindow)?.maximize()
            : (BrowserWindow.getFocusedWindow() ?? mainWindow)?.unmaximize()
    );

    ipcMain.handle("stopPlaying", () => {
        options.onStopPlaying?.()
        return discord.setStatusPage('Acabou de fechar o Minecraft')
    });
    ipcMain.handle("changedPage", (event, page) => discord.setStatusPage(page));
    ipcMain.handle("playing", (event, version) => {
        options.onStartPlaying?.(version)
        return discord.setPlaying(version)
    });
    ipcMain.handle('fileExplorer', (event) => {
        const path = dialog.showOpenDialogSync({
            properties: ['openDirectory']
        })
        return path
    });

    ipcMain.handle('getInstances', (event, instancesPath) => {
        try {
            const instances = readdirSync(instancesPath);
            return instances
        } catch (error) {
            console.error("Erro ao ler pastas de perfis:", error);
            return []
        }
    });

    ipcMain.handle('delete-instance-folder', async (event, path) => {
        try {
            rmSync(path, { recursive: true, force: true });
            return true;
        }
        catch (error) {
            console.error("Erro ao deletar pasta do perfil:", error);
            return false;
        }
    });
    ipcMain.handle('create-instance-folder', async (event, path) => {
        try {
            mkdirSync(path, { recursive: true });
            return path
        } catch (error) {
            console.error("Erro ao criar pasta do perfil:", error);
            return false;
        }
    });
    
    ipcMain.handle('openDevtools', () => BrowserWindow.getFocusedWindow()?.webContents.openDevTools());
    ipcMain.handle('loginMicrosoft', async (event, clientId: string) => {
        const microsoft = new Microsoft(clientId);
        const auth = await microsoft.getAuth();
        return auth;
    });
}

export {
    initIPCHandlers,
}