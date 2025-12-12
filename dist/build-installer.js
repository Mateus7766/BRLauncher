"use strict";
// Arquivo necessario para criar o executavel (.exe) desse programa :)
// Esse arquivo não é necessario em nenhum outro arquivo e pode ser ignorado na compilação do typescript
// Para rodar esse arquivo use: npx ts-node src/build-installer
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_wix_msi_1 = require("electron-wix-msi");
const config_1 = __importDefault(require("./config"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
console.log('Limpando banco de dados para produção... 🚯');
(0, child_process_1.exec)('npx prisma migrate reset --force', () => {
    console.log('Banco de dados limpo, iniciando a compilação. 💿');
    const APP_DIR = path_1.default.resolve(process.cwd(), './build/BRLauncher-win32-x64');
    const OUT_DIR = path_1.default.resolve(process.cwd(), './windows_installer');
    fs_1.default.rmSync(path_1.default.resolve(process.cwd(), './build/BRLauncher-win32-x64/resources/app/src'), { recursive: true, force: true });
    const msiCreator = new electron_wix_msi_1.MSICreator({
        icon: './src/core/imgs/icons/icon.ico',
        arch: 'x64',
        language: 1046,
        appDirectory: APP_DIR,
        outputDirectory: OUT_DIR,
        description: config_1.default.app_des,
        exe: config_1.default.app_name,
        name: config_1.default.app_name,
        manufacturer: 'Mateus7766',
        version: process.env.npm_package_version,
        ui: {
            chooseDirectory: true
        },
    });
    msiCreator.create().then(() => msiCreator.compile());
});
