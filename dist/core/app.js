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
const home_js_1 = require("./js/home.js");
const accounts_js_1 = require("./js/accounts.js");
const config_js_1 = require("./js/config.js");
const about_js_1 = require("./js/about.js");
const mods_js_1 = require("./js/mods.js");
const original_fs_1 = require("original-fs");
const electron_1 = require("electron");
const account_js_1 = __importDefault(require("../db/account.js"));
const path_1 = __importDefault(require("path"));
class App {
    setup() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("[CLIENT SIDE] O CLASSE PRINCIPAL DO APP FOI CARREGADA");
            window.resizeTo(1200, 700);
            yield this.initPages([home_js_1.HomePage]);
            yield this.initPages([accounts_js_1.AccountsPage]);
            yield this.initPages([config_js_1.ConfigPage]);
            yield this.initPages([about_js_1.AboutPage]);
            yield this.initPages([mods_js_1.ModsPage]);
            yield this.sideBar();
            this.topBar();
            this.setPage('home');
            this.removeLoad();
        });
    }
    removeLoad() {
        const loading = document.getElementById('loading');
        loading.classList.add('hidden');
        loading.classList.remove('flex');
    }
    initPages(pages) {
        return __awaiter(this, void 0, void 0, function* () {
            const pagesDiv = document.getElementById('content');
            for (let Page of pages) {
                const page = new Page();
                const pageContent = (0, original_fs_1.readFileSync)(path_1.default.join(__dirname.replace('core', ''), 'pages', 'partials', `${page.pageName}.html`), 'utf-8');
                const pageDiv = document.createElement("div");
                pageDiv.classList.add('w-full', 'h-full', 'hidden');
                pageDiv.id = page.pageName;
                pageDiv.innerHTML = pageContent;
                pagesDiv.appendChild(pageDiv);
                yield page.init();
            }
        });
    }
    setPage(pageName) {
        const page = document.getElementById(pageName);
        const active = document.querySelector(".block");
        active === null || active === void 0 ? void 0 : active.classList.add('hidden');
        active === null || active === void 0 ? void 0 : active.classList.remove('block');
        page.classList.add('block');
        page.classList.remove('hidden');
        electron_1.ipcRenderer.invoke('changedPage', pageName.replace('home', 'Tela Inicial').replace('accounts', 'Configurando Contas').replace('config', 'Configurando o Launcher').replace('about', 'Lendo o About').replace('mods', 'Tela de Mods'));
    }
    sideBar() {
        return __awaiter(this, void 0, void 0, function* () {
            const sideUsername = document.getElementById('side-username');
            const sidebar = document.getElementById('sidebar');
            const sideBarButtons = sidebar.querySelectorAll(".sidebar-button");
            sideBarButtons.forEach((button) => {
                button.addEventListener("click", (event) => {
                    sidebar.querySelector(".sidebar-active").classList.remove("sidebar-active");
                    button.classList.add("sidebar-active");
                });
            });
            const acc = yield account_js_1.default.getAtual();
            if (!acc)
                sideUsername.innerHTML = 'Não logado';
            else
                sideUsername.innerHTML = acc.name;
        });
    }
    topBar() {
        const mods_btn = document.getElementById('mods-btn');
        mods_btn.addEventListener('click', () => this.setPage('mods'));
        const about_btn = document.getElementById('about-btn');
        about_btn.addEventListener('click', () => this.setPage('about'));
        const home_btn = document.getElementById('home-btn');
        home_btn.addEventListener('click', () => this.setPage('home'));
        const config_btn = document.getElementById('config-btn');
        config_btn.addEventListener('click', () => this.setPage('config'));
        const minimize = document.getElementById("minimize");
        const maxmize = document.getElementById("maxmize");
        const accounts = document.getElementById('accounts-btn');
        const close = document.getElementById("close");
        minimize.addEventListener("click", () => electron_1.ipcRenderer.invoke("minimize"));
        close.addEventListener("click", () => window.close());
        maxmize.addEventListener("click", () => electron_1.ipcRenderer.invoke("maxmize"));
        accounts.addEventListener('click', () => this.setPage('accounts'));
    }
}
window.addEventListener("DOMContentLoaded", () => __awaiter(void 0, void 0, void 0, function* () {
    yield (new App()).setup();
}));
