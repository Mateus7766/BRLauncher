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
const index_js_1 = require("./index.js");
const os_1 = __importDefault(require("os"));
const appdata_path_1 = __importDefault(require("appdata-path"));
const shelljs_1 = __importDefault(require("shelljs"));
const javaPath = shelljs_1.default.exec("where java");
electron_1.ipcMain.handle("launcher:update", (_, data) => __awaiter(void 0, void 0, void 0, function* () {
    const { path, min, max, width, height, elyBy } = data;
    const newData = yield index_js_1.prisma.launcher.update({
        where: { id: 1 },
        data: { path, min, max, width, height, elyBy }
    });
    return newData;
}));
electron_1.ipcMain.handle("launcher:resetConfig", () => __awaiter(void 0, void 0, void 0, function* () {
    const exists = yield index_js_1.prisma.launcher.findUnique({
        where: { id: 1 }
    });
    if (exists) {
        return yield index_js_1.prisma.launcher.update({
            where: { id: 1 },
            data: {
                path: (0, appdata_path_1.default)(".minecraft"),
                min: 1024,
                max: Math.round(os_1.default.totalmem() / (1024 ** 2) / 2),
                width: 1000,
                height: 600,
                javaPath,
                elyBy: true,
            }
        });
    }
    return yield index_js_1.prisma.launcher.create({
        data: {
            path: (0, appdata_path_1.default)(".minecraft"),
            min: 1024,
            max: Math.round(os_1.default.totalmem() / (1024 ** 2) / 2),
            width: 1000,
            height: 600,
            javaPath,
            elyBy: true
        }
    });
}));
electron_1.ipcMain.handle("launcher:config", () => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield index_js_1.prisma.launcher.findUnique({
        where: { id: 1 }
    });
    return data;
}));
electron_1.ipcMain.handle("account:update", (_1, _a) => __awaiter(void 0, [_1, _a], void 0, function* (_, { id, data }) {
    const account = yield index_js_1.prisma.account.update({
        where: { id },
        data
    });
    return account;
}));
electron_1.ipcMain.handle("account:create", (_, data) => __awaiter(void 0, void 0, void 0, function* () {
    const createdAccount = yield index_js_1.prisma.account.create({
        data: {
            access_token: data.access_token,
            client_token: data.client_token,
            uuid: data.uuid,
            user_properties: JSON.stringify(data.user_properties),
            meta: JSON.stringify(data.meta),
            name: data.name,
            selected: false,
            type: data.type
        }
    });
    return createdAccount;
}));
electron_1.ipcMain.handle("account:delete", (_, id) => __awaiter(void 0, void 0, void 0, function* () {
    const deletedAccount = yield index_js_1.prisma.account.delete({
        where: { id }
    });
    return deletedAccount;
}));
electron_1.ipcMain.handle("account:getById", (_, id) => __awaiter(void 0, void 0, void 0, function* () {
    const account = yield index_js_1.prisma.account.findUnique({
        where: { id }
    });
    return account;
}));
electron_1.ipcMain.handle("account:getAtual", () => __awaiter(void 0, void 0, void 0, function* () {
    const account = yield index_js_1.prisma.account.findFirst({
        where: { selected: true }
    });
    return account;
}));
electron_1.ipcMain.handle("account:accounts", () => __awaiter(void 0, void 0, void 0, function* () {
    const accounts = yield index_js_1.prisma.account.findMany({});
    return accounts;
}));
