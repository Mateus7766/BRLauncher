"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Account = void 0;
const electron_1 = require("electron");
exports.Account = {
    update: (id, data) => electron_1.ipcRenderer.invoke("account:update", { id, data }),
    create: (data) => electron_1.ipcRenderer.invoke("account:create", data),
    delete: (id) => electron_1.ipcRenderer.invoke("account:delete", id),
    getById: (id) => electron_1.ipcRenderer.invoke("account:getById", id),
    getAtual: () => electron_1.ipcRenderer.invoke("account:getAtual"),
    accounts: () => electron_1.ipcRenderer.invoke("account:accounts")
};
exports.default = exports.Account;
