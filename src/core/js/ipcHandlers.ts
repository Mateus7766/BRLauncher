import { ipcMain, BrowserWindow, dialog } from "electron";
import { DiscordStatusManager } from "./discordStatus.js";
import { Microsoft } from "minecraft-java-core";
import { rmdirSync, mkdirSync, rm, readdirSync, rmSync } from "node:fs";

const discord = new DiscordStatusManager()


const initIPCHandlers = () => {
    ipcMain.handle("minimize", (event) =>
        BrowserWindow.getFocusedWindow()?.minimize()
    )
    ipcMain.handle("close", (event) => BrowserWindow.getFocusedWindow()?.close());
    ipcMain.handle("maxmize", (event) =>
        !BrowserWindow.getFocusedWindow()?.isMaximized() ? BrowserWindow.getFocusedWindow()?.maximize() : BrowserWindow.getFocusedWindow()?.unmaximize()
    );

    ipcMain.handle("stopPlaying", () => discord.setStatusPage('Acabou de fechar o Minecraft'));
    ipcMain.handle("changedPage", (event, page) => discord.setStatusPage(page));
    ipcMain.handle("playing", (event, version) => discord.setPlaying(version));
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
    ipcMain.handle('create-instance-folder', async (event, path) => {
        try {
            mkdirSync(path, { recursive: true });
            return path
        } catch (error) {
            console.error("Erro ao criar pasta do perfil:", error);
            return false
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