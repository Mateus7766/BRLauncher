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
exports.ConfigPage = void 0;
const base_js_1 = require("../base.js");
const launcher_js_1 = __importDefault(require("../../db/launcher.js"));
const os_1 = __importDefault(require("os"));
const electron_1 = require("electron");
class ConfigPage extends base_js_1.PageBase {
    constructor() {
        super({
            pageName: 'config'
        });
        console.log("[CLIENT SIDE] CLASSE DA TELA DE CONFIGURAÇÕES CARREGADA");
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield launcher_js_1.default.config())) {
                try {
                    yield launcher_js_1.default.resetConfig();
                }
                catch (_a) {
                    this.notification("Não foi possivel escrever no banco de dados, tente executar o BRLauncher como administrador.");
                }
            }
            yield this.startConfig();
            yield this.initEvents();
        });
    }
    startConfig() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield launcher_js_1.default.config();
            if (!data)
                return this.notification('Algo deu <bold>extremamente</bold> errado. Aparentemente não foi possivel criar o banco de dados, para corrigir o problema, abra o BRLauncher como administrador.');
            const dirInput = document.getElementById('dir');
            dirInput.value = data.path;
            const heightInput = document.getElementById('height');
            heightInput.value = data.height.toString();
            const widthInput = document.getElementById('width');
            widthInput.value = data.width.toString();
            const minInput = document.getElementById('min');
            minInput.min = '1024';
            minInput.max = Math.round((os_1.default.totalmem()) / (1020 ** 2)).toString();
            minInput.value = data.min.toString();
            const maxInput = document.getElementById('max');
            maxInput.min = '1024';
            maxInput.max = Math.round((os_1.default.totalmem()) / (1020 ** 2)).toString();
            maxInput.value = data.max.toString();
            const maxPanel = document.getElementById('maxPanel');
            const minPanel = document.getElementById('minPanel');
            minPanel.innerHTML = minInput.value;
            maxPanel.innerHTML = maxInput.value;
            const elyBy = document.getElementById('toggleEly');
            elyBy.checked = data.elyBy;
            const elyStatus = document.getElementById('elyStatus');
            elyStatus.textContent = elyBy.checked ? "Ativado" : "Desativado";
            elyStatus.className = elyBy.checked ? "text-green-500" : "text-red-500";
        });
    }
    initEvents() {
        return __awaiter(this, void 0, void 0, function* () {
            const widthInput = document.getElementById('width');
            const dirInput = document.getElementById('dir');
            const heightInput = document.getElementById('height');
            const minInput = document.getElementById('min');
            const maxInput = document.getElementById('max');
            const maxPanel = document.getElementById('maxPanel');
            const minPanel = document.getElementById('minPanel');
            const fileExplorer = document.getElementById('fileExplorer');
            const elyBy = document.getElementById('toggleEly');
            minInput.addEventListener('input', () => minPanel.innerHTML = minInput.value);
            maxInput.addEventListener('input', () => maxPanel.innerHTML = maxInput.value);
            const saveButton = document.getElementById('salvar');
            saveButton.addEventListener('click', () => {
                launcher_js_1.default.update(dirInput.value, parseInt(minInput.value), parseInt(maxInput.value), parseInt(widthInput.value), parseInt(heightInput.value), elyBy.checked)
                    .then(() => {
                    this.notification('Configuraçõe salvas 💫');
                    this.startConfig();
                })
                    .catch(() => this.notification("Não foi possivel escrever no banco de dados, tente executar o BRLauncher como administrador."));
            });
            const resetButton = document.getElementById('reset');
            resetButton.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
                launcher_js_1.default.resetConfig()
                    .then(() => {
                    this.notification('Configurações resetadas 🗑️');
                    this.startConfig();
                })
                    .catch(() => this.notification("Não foi possivel escrever no banco de dados, tente executar o BRLauncher como administrador."));
            }));
            fileExplorer.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
                const path = yield electron_1.ipcRenderer.invoke('fileExplorer');
                if (!path)
                    return 0;
                dirInput.value = path[0];
            }));
        });
    }
}
exports.ConfigPage = ConfigPage;
