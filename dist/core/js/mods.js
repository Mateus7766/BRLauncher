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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModsPage = void 0;
const base_1 = require("../base");
const modrinth_1 = require("@xmcl/modrinth");
class ModsPage extends base_1.PageBase {
    constructor() {
        super({
            pageName: 'mods'
        });
        this.searchMods = (query) => __awaiter(this, void 0, void 0, function* () {
            try {
                const results = yield this.client.searchProjects({
                    query: query,
                    facets: '[["project_type:mod"]]',
                    limit: 20,
                });
                return results.hits;
            }
            catch (error) {
                console.error("Erro ao buscar mods:", error);
                return [];
            }
        });
        this.updateModList = (query) => __awaiter(this, void 0, void 0, function* () {
            const modListContainer = document.getElementById('mods-list');
            modListContainer.innerHTML = 'Carregando...';
            const mods = yield this.searchMods(query);
            modListContainer.innerHTML = '';
            mods.forEach(mod => {
                const modElement = document.createElement('div');
                modElement.classList.add('flex', 'mod-item', 'p-4', 'border-b', 'border-gray-300', 'hover:shadow-lg', 'cursor-pointer', 'bg-zinc-900', 'rounded-md', 'mb-2', 'items-center', 'space-x-4');
                modElement.innerHTML = `
                <img src="${mod.icon_url}" alt="${mod.title} Icon" class="w-16 h-16 rounded-md mb-2">
                <div>
                    <h3 class="text-lg font-bold">${mod.title}</h3>
                    <p class="text-sm text-gray-600">${mod.description}</p>
                </div>
            `;
                modListContainer.appendChild(modElement);
            });
        });
        this.client = new modrinth_1.ModrinthV2Client();
        console.log("[CLIENT SIDE] CLASSE DA TELA DE MODS CARREGADA");
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.updateModList('adventure');
        });
    }
}
exports.ModsPage = ModsPage;
