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
exports.AccountsPage = void 0;
const base_js_1 = require("../base.js");
const minecraft_java_core_1 = require("minecraft-java-core");
const account_js_1 = __importDefault(require("../../db/account.js"));
const electron_1 = require("electron");
class AccountsPage extends base_js_1.PageBase {
    constructor() {
        super({
            pageName: 'accounts'
        });
        console.log("[CLIENT SIDE] GERENCIADOR DE CONTAS CARREGADO");
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.listAccounts();
            this.openNewElyByAccMenu();
            this.closeNewElyByAccMenu();
            this.openNewaccMenu();
            this.closeNewaccMenu();
            this.createAccount();
        });
    }
    selectAccount(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const atual = yield account_js_1.default.getAtual();
            yield account_js_1.default.update(atual === null || atual === void 0 ? void 0 : atual.id, {
                selected: false
            });
            const upacc = yield account_js_1.default.update(id, {
                selected: true
            });
            const sideUsername = document.getElementById('side-username');
            sideUsername.innerHTML = upacc.name;
        });
    }
    deleteAccount(id, div, removeBtn) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const acc = yield account_js_1.default.getById(id);
                if (acc === null || acc === void 0 ? void 0 : acc.selected)
                    return this.notification('Você não pode remover a conta que você está usando');
                const lengthacc = yield account_js_1.default.accounts();
                if (!lengthacc) {
                    const sideUsername = document.getElementById('side-username');
                    sideUsername.innerHTML = 'Não logado';
                }
                const list = document.getElementById('acc-list');
                if (list.contains(div))
                    list.removeChild(div);
                else {
                    const div2 = document.getElementById(`${id}_div`);
                    div2 === null || div2 === void 0 ? void 0 : div2.remove();
                }
                yield account_js_1.default.delete(id);
            }
            catch (e) {
                this.notification('Algo deu errado ' + e);
            }
        });
    }
    updateList(name, id, accountType) {
        return __awaiter(this, void 0, void 0, function* () {
            const list = document.getElementById('acc-list');
            const div = this.returnAccountCard(name, id, accountType);
            list.insertBefore(div, list.lastChild);
            const selecBtn = document.getElementById(`${id}_add`);
            selecBtn.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () { return yield this.selectAccount(id); }));
            const removeBtn = document.getElementById(`${id}_remove`);
            removeBtn.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () { return yield this.deleteAccount(id, div, removeBtn); }));
        });
    }
    listAccounts() {
        return __awaiter(this, void 0, void 0, function* () {
            const oldList = document.getElementById('acc-list');
            const accounts = yield account_js_1.default.accounts();
            if (!accounts.length)
                oldList.innerHTML += '<p>Ops você não tem nenhuma conta adicionada 😭</p>';
            for (let account of accounts) {
                const list = document.getElementById('acc-list');
                const card = this.returnAccountCard(account.name, account.id, account.type);
                list.appendChild(card);
                const checkExist = setInterval(() => {
                    const selecBtn = document.getElementById(`${account.id}_add`);
                    const removeBtn = document.getElementById(`${account.id}_remove`);
                    if (selecBtn && removeBtn) {
                        selecBtn.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () { return yield this.selectAccount(account.id); }));
                        removeBtn.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () { return yield this.deleteAccount(account.id, card); }));
                        clearInterval(checkExist);
                    }
                    else
                        console.log('Prourando conta');
                }, 100);
            }
            const buttonsDiv = document.createElement('div');
            buttonsDiv.classList.add('flex', 'flex-row', 'gap-2', 'itents-center');
            oldList.appendChild(buttonsDiv);
            const addLocalaAcc = `
        <button id="add-acc" class="play-btn"><span class="material-icons mr-1">create_new_folder</span> Criar conta local</button>
    `;
            const addMicrosoftAcc = `
        <button id="microsoft-login-btn" class="microsoft-btn"><svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24" viewBox="0 0 48 48">
<path fill="#ff5722" d="M6 6H22V22H6z" transform="rotate(-180 14 14)"></path><path fill="#4caf50" d="M26 6H42V22H26z" transform="rotate(-180 34 14)"></path><path fill="#ffc107" d="M26 26H42V42H26z" transform="rotate(-180 34 34)"></path><path fill="#03a9f4" d="M6 26H22V42H6z" transform="rotate(-180 14 34)"></path>
</svg> Login com Microsoft</button>
    `;
            const addElybyAcc = `<button id="elyby-login-btn" class="elyby-btn"><?xml version="1.0" encoding="utf-8"?><!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
<svg width="24px" height=24px" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><defs><style>.a{fill:none;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;}</style></defs><path class="a" d="M40.5,5.5H7.5a2,2,0,0,0-2,2v33a2,2,0,0,0,2,2h33a2,2,0,0,0,2-2V7.5A2,2,0,0,0,40.5,5.5Z"/><path class="a" d="M28.8315,28.5616A5.5586,5.5586,0,0,1,24,31.3677h0a5.56,5.56,0,0,1-5.5605-5.56V22.1928A5.56,5.56,0,0,1,24,16.6323h0a5.56,5.56,0,0,1,5.5605,5.56V24H18.44"/></svg> Login com Elyby</button>`;
            buttonsDiv.innerHTML += addLocalaAcc;
            buttonsDiv.innerHTML += addMicrosoftAcc;
            buttonsDiv.innerHTML += addElybyAcc;
        });
    }
    returnAccountCard(name, id, accountType) {
        let avatarIcons = {
            "Local": '../core/imgs/local.png',
            "Microsoft": `https://mc-heads.net/avatar/${name}/100/nohelm.png`,
            "Ely.by": `http://skinsystem.ely.by/skins/${name}.png`
        };
        const div = document.createElement('div');
        div.classList.add('flex', 'flex-col', 'bg-zinc-900', 'shadow-sm', 'p-2', 'w-96', 'gap-y-3', 'rounded', 'hover:scale-105', 'duration-200');
        div.id = `${id}_div`;
        const content = `
        <div class="flex gap-x-3">
        <img src="${avatarIcons[accountType]}" width="50">
           
            <div class="flex flex-col">
                <p id="acc-username">${name}</p>
                <p class="text-xs mb-2">Conta ${accountType}</p>
            </div>
        </div>
        <div class="flex gap-2">
            <button class="text-xs bg-green-500 py-0.5 px-1 flex items-center" id="${id}_add"><span class="material-icons mr-1">done</span> Escolher conta</button>
            <button class="text-xs bg-red-500 py-0.5 px-1 flex items-center" id="${id}_remove"><span class="material-icons mr-1" >remove_circle</span> Remover conta</button>
        </div>
        `;
        div.innerHTML += content;
        return div;
    }
    openNewElyByAccMenu() {
        const activebtn = document.getElementById('elyby-login-btn');
        activebtn.addEventListener('click', () => {
            const menu = document.getElementById('acc-menu-elyby');
            menu.classList.add('flex');
            menu.classList.remove('hidden');
        });
    }
    closeNewElyByAccMenu() {
        const closebtn = document.getElementById('close-menu-ely');
        closebtn.addEventListener('click', () => {
            const menu = document.getElementById('acc-menu-elyby');
            menu.classList.add('hidden');
            menu.classList.remove('flex');
        });
    }
    openNewaccMenu() {
        const activebtn = document.getElementById('add-acc');
        activebtn.addEventListener('click', () => {
            const menu = document.getElementById('acc-menu');
            menu.classList.add('flex');
            menu.classList.remove('hidden');
        });
    }
    closeNewaccMenu() {
        const closebtn = document.getElementById('close-menu');
        closebtn.addEventListener('click', () => {
            const menu = document.getElementById('acc-menu');
            menu.classList.add('hidden');
            menu.classList.remove('flex');
        });
    }
    createAccount() {
        return __awaiter(this, void 0, void 0, function* () {
            const createbtn = document.getElementById('create-btn');
            const microsoftbtn = document.getElementById('microsoft-login-btn');
            const elybybtn = document.getElementById('create-btn-ely');
            elybybtn.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
                const menu = document.getElementById('acc-menu-elyby');
                menu.classList.add('hidden');
                menu.classList.remove('flex');
                const username = document.getElementById('elyby-username').value;
                const password = document.getElementById('elyby-password').value;
                try {
                    const data = yield fetch('https://authserver.ely.by/auth/authenticate', {
                        method: "POST",
                        body: JSON.stringify({
                            username, password,
                            requestUser: true
                        })
                    });
                    const json = yield data.json();
                    const jsonFormatted = {
                        access_token: json.accessToken,
                        client_token: json.clientToken,
                        uuid: json.user.id,
                        name: json.user.username,
                        user_properties: json.user.properties[0],
                        meta: {
                            type: 'ely'
                        },
                        type: 'Ely.by',
                    };
                    account_js_1.default.create(jsonFormatted)
                        .then((data) => __awaiter(this, void 0, void 0, function* () {
                        const atual = yield account_js_1.default.getAtual();
                        if (!atual) {
                            account_js_1.default.update(data.id, {
                                selected: true
                            });
                            const sideUsername = document.getElementById('side-username');
                            sideUsername.innerHTML = data.name;
                        }
                        this.updateList(data.name, data.id, 'Ely.by');
                        this.notification('Conta criada!');
                    }))
                        .catch(e => {
                        this.notification("Não foi possivel adicionar sua conta, tente novamente executando o BRLauncher como administrador.");
                    });
                }
                catch (e) {
                    this.notification('Erro ao autenticar com ElyBy, desculpa.');
                }
            }));
            microsoftbtn.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
                const acc = yield electron_1.ipcRenderer.invoke("loginMicrosoft");
                if (acc.error) {
                    this.notification('Falha ao logar com Microsoft: Parece que você não tem o minecraft comprado nessa conta.');
                    return;
                }
                acc.type = 'Microsoft';
                account_js_1.default.create(acc)
                    .then((data) => __awaiter(this, void 0, void 0, function* () {
                    const atual = yield account_js_1.default.getAtual();
                    if (!atual) {
                        account_js_1.default.update(data.id, {
                            selected: true
                        });
                        const sideUsername = document.getElementById('side-username');
                        sideUsername.innerHTML = data.name;
                    }
                    this.updateList(data.name, data.id, 'Microsoft');
                    this.notification('Conta Microsoft adicionada!');
                }))
                    .catch(e => this.notification("Não foi possivel adicionar sua conta, tente novamente executando o BRLauncher como administrador."));
                const menu = document.getElementById('acc-menu');
                menu.classList.add('hidden');
                menu.classList.remove('flex');
            }));
            createbtn.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
                const username = document.getElementById('new-acc-username').value;
                if (!username)
                    return this.notification('Escreva algo!');
                const auth = yield minecraft_java_core_1.Mojang.login(username);
                if (!auth)
                    return;
                auth.type = 'Local';
                account_js_1.default.create(auth)
                    .then((data) => __awaiter(this, void 0, void 0, function* () {
                    const atual = yield account_js_1.default.getAtual();
                    if (!atual) {
                        account_js_1.default.update(data.id, {
                            selected: true
                        });
                        const sideUsername = document.getElementById('side-username');
                        sideUsername.innerHTML = data.name;
                    }
                    this.updateList(data.name, data.id, 'Local');
                    this.notification('Conta criada!');
                }))
                    .catch(e => this.notification("Não foi possivel criar sua conta, tente novamente executando o BRLauncher como administrador."));
                const menu = document.getElementById('acc-menu');
                menu.classList.add('hidden');
                menu.classList.remove('flex');
            }));
        });
    }
}
exports.AccountsPage = AccountsPage;
