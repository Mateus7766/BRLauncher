import { PageBase } from "../base";
import { ModrinthV2Client, SearchResult, SearchResultHit } from "@xmcl/modrinth";

class ModsPage extends PageBase {
    client: ModrinthV2Client;
    constructor() {
        super({
            pageName: 'mods'
        })

        this.client = new ModrinthV2Client();

        console.log("[CLIENT SIDE] CLASSE DA TELA DE MODS CARREGADA")
    }
    async init() {
        await this.updateModList('adventure');
    }

    private searchMods = async (query: string): Promise<SearchResultHit[]> => {
        try {
            const results = await this.client.searchProjects({
                query: query,
                facets: '[["project_type:mod"]]',
                limit: 20,
            });
            return results.hits;
        } catch (error) {
            console.error("Erro ao buscar mods:", error);
            return [];
        }
    }

    updateModList = async (query: string) => {
        const modListContainer = document.getElementById('mods-list') as HTMLDivElement;
        modListContainer.innerHTML = 'Carregando...';
        const mods = await this.searchMods(query);
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
    }
}

export {
    ModsPage
}