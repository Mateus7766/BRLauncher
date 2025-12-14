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
exports.ModsPage = void 0;
const base_1 = require("../base");
const modrinth_1 = require("@xmcl/modrinth");
const electron_1 = require("electron");
const launcher_1 = __importDefault(require("../../db/launcher"));
const path_1 = require("path");
const fs_1 = __importDefault(require("fs"));
class ModsPage extends base_1.PageBase {
    constructor() {
        super({
            pageName: 'mods'
        });
        this.selectedModId = null;
        this.searchMods = (query) => __awaiter(this, void 0, void 0, function* () {
            try {
                const results = yield this.client.searchProjects({
                    query: query,
                    facets: '[["project_type:mod"]]',
                    limit: 300,
                });
                return results.hits;
            }
            catch (error) {
                console.error("Erro ao buscar mods:", error);
                return [];
            }
        });
        this.initCloseBtn = () => {
            const closeButton = document.getElementById('close-mod-install');
            closeButton.addEventListener('click', () => {
                const modInstallModal = document.getElementById('mod-install-modal');
                modInstallModal.classList.remove('flex');
                modInstallModal.classList.add('hidden');
            });
        };
        this.initCancelDownloadBtn = () => {
            const cancelButton = document.getElementById('cancel-mod-install');
            cancelButton.addEventListener('click', () => {
                const modInstallModal = document.getElementById('mod-install-modal');
                modInstallModal.classList.remove('flex');
                modInstallModal.classList.add('hidden');
            });
        };
        this.initConfirmDownloadBtn = () => {
            const confirmButton = document.getElementById('confirm-mod-install');
            confirmButton.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () { return yield this.dowloadMod(); }));
            const modInstallModal = document.getElementById('mod-install-modal');
            modInstallModal.classList.remove('flex');
            modInstallModal.classList.add('hidden');
        };
        this.updateModList = (query) => __awaiter(this, void 0, void 0, function* () {
            const modListContainer = document.getElementById('mods-list');
            modListContainer.innerHTML = 'Carregando...';
            const mods = yield this.searchMods(query);
            modListContainer.innerHTML = '';
            mods.forEach((mod, i) => {
                const modElement = document.createElement('div');
                modElement.classList.add('flex', 'mod-item', 'p-4', 'border-b', 'border-gray-300', 'hover:shadow-lg', 'cursor-pointer', 'bg-zinc-900', 'rounded-md', 'mb-2', 'items-center', 'space-x-4');
                modElement.innerHTML = `
                <img src="${mod.icon_url}" alt="${mod.title} Icon" class="w-16 h-16 rounded-md mb-2">
                <div class="flex-1">
                    <h3 class="text-lg font-bold">${mod.title}</h3>
                    <p class="text-sm text-gray-600">${mod.description}</p>
                </div>
                <button class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md" id="download-${i}">Download</button>
            `;
                modListContainer.appendChild(modElement);
                const downloadButton = document.getElementById(`download-${i}`);
                downloadButton.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
                    const modInstallModal = document.getElementById('mod-install-modal');
                    modInstallModal.classList.remove('hidden');
                    modInstallModal.classList.add('flex');
                    const versionSelect = document.getElementById('install-game-version');
                    const loaderSelect = document.getElementById('install-loader');
                    const profileSelect = document.getElementById('install-profile');
                    const modData = yield this.client.getProject(mod.slug);
                    versionSelect.options.length = 0;
                    loaderSelect.options.length = 0;
                    modData.game_versions.reverse();
                    modData.game_versions.forEach((version) => {
                        versionSelect.options.add(new Option(version, version));
                    });
                    modData.loaders.forEach((loader) => {
                        loaderSelect.options.add(new Option(loader, loader));
                    });
                    const instances = yield this.getMinecraftInstances();
                    profileSelect.options.length = 0;
                    profileSelect.options.add(new Option('Não instalar em nenhum perfil', ''));
                    instances.forEach((instance) => {
                        profileSelect.options.add(new Option(instance, instance));
                    });
                    this.selectedModId = mod.slug;
                }));
            });
        });
        this.dowloadMod = () => __awaiter(this, void 0, void 0, function* () {
            try {
                const modId = this.selectedModId;
                if (!modId) {
                    this.notification("Nenhum mod selecionado para download.");
                    return;
                }
                const mod = yield this.client.getProject(modId);
                const versions = yield this.client.getProjectVersions(modId);
                if (versions.length === 0) {
                    this.notification("Nenhuma versão compatível encontrada para os critérios selecionados.");
                    return;
                }
                const latestVersion = versions[0];
                if (latestVersion.files.length === 0) {
                    this.notification("Nenhum arquivo encontrado para a versão do mod: " + latestVersion.name);
                    return;
                }
                const downloadLoadingModal = document.getElementById('download-animation');
                downloadLoadingModal.classList.remove('hidden');
                downloadLoadingModal.classList.add('relative');
                const versionSelect = document.getElementById('install-game-version');
                const loaderSelect = document.getElementById('install-loader');
                const profileSelect = document.getElementById('install-profile');
                const dowloadUrl = `https://api.modrinth.com/v2/project/${mod.slug}/version`;
                const res = yield fetch(dowloadUrl);
                const versionsData = yield res.json();
                const versao = versionsData.find((v) => v.game_versions.includes(versionSelect.value) &&
                    v.loaders.includes(loaderSelect.value));
                if (!versao) {
                    this.notification("Nenhuma versão compatível encontrada para os critérios selecionados.");
                    return;
                }
                const arquivo = versao.files[0];
                const modD = yield fetch(arquivo.url);
                const buffer = yield modD.arrayBuffer();
                const path = yield launcher_1.default.config();
                const instancesPath = profileSelect.value ? (0, path_1.join)(path.path, 'instances', profileSelect.value) : path.path;
                if (!fs_1.default.existsSync((0, path_1.join)(instancesPath, 'mods'))) {
                    fs_1.default.mkdirSync((0, path_1.join)(instancesPath, "mods"), { recursive: true });
                }
                fs_1.default.writeFileSync((0, path_1.join)(instancesPath, "mods", arquivo.filename), Buffer.from(buffer));
                this.notification(`Mod ${mod.title} baixado com sucesso para o diretorio ${(0, path_1.join)(instancesPath, "mods")}`);
                downloadLoadingModal.classList.add('hidden');
                downloadLoadingModal.classList.remove('relative');
            }
            catch (error) {
                console.error("Erro ao baixar o mod:", error);
            }
        });
        this.client = new modrinth_1.ModrinthV2Client();
        console.log("[CLIENT SIDE] CLASSE DA TELA DE MODS CARREGADA");
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.updateModList('');
            this.initConfirmDownloadBtn();
            this.initCancelDownloadBtn();
            this.initCloseBtn();
            this.initSearch();
        });
    }
    initSearch() {
        const searchInput = document.getElementById('mods-search');
        searchInput.addEventListener('input', () => __awaiter(this, void 0, void 0, function* () {
            const query = searchInput.value.trim();
            yield this.updateModList(query);
        }));
    }
    getMinecraftInstances() {
        return __awaiter(this, void 0, void 0, function* () {
            const launcherSettings = yield launcher_1.default.config();
            if (!launcherSettings)
                return this.notification("Algo deu errado, tente reiniciar o Launcher com permisões de administrador.");
            let instances = yield electron_1.ipcRenderer.invoke('getInstances', launcherSettings.path + '\\instances');
            return instances;
        });
    }
}
exports.ModsPage = ModsPage;
