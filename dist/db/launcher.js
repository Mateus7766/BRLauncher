"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Launcher = void 0;
const electron_1 = require("electron");
exports.Launcher = {
    update: (path, min, max, width, height, elyBy, lastUsed) => electron_1.ipcRenderer.invoke("launcher:update", { path, min, max, width, height, elyBy, lastUsed }),
    resetConfig: () => electron_1.ipcRenderer.invoke("launcher:resetConfig"),
    config: () => electron_1.ipcRenderer.invoke("launcher:config")
};
exports.default = exports.Launcher;
