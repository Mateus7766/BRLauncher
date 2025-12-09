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
            buttonsDiv.innerHTML += addLocalaAcc;
            buttonsDiv.innerHTML += addMicrosoftAcc;
        });
    }
    returnAccountCard(name, id, accountType) {
        const div = document.createElement('div');
        div.classList.add('flex', 'flex-col', 'bg-zinc-900', 'shadow-sm', 'p-2', 'w-96', 'gap-y-3', 'rounded', 'hover:scale-105', 'duration-200');
        div.id = `${id}_div`;
        const content = `
        <div class="flex gap-x-3">
        ${accountType == 'Microsoft' ? ` <img src="https://mc-heads.net/avatar/${name}/100/nohelm.png" width="50">` : ` <img src="../core/imgs/${accountType.toLowerCase()}.png" width="50">`}
           
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
