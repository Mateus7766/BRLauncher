import { PageBase } from "../base";
import { ModrinthV2Client, SearchResultHit } from "@xmcl/modrinth";
import { ipcRenderer } from "electron";
import LauncherSettings from "../../db/launcher";
import { join } from "path";
import fs from "fs";

class ModsPage extends PageBase {
    client: ModrinthV2Client;
    selectedModId: string | null = null;
    constructor() {
        super({
            pageName: 'mods'
        })

        this.client = new ModrinthV2Client();

        console.log("[CLIENT SIDE] CLASSE DA TELA DE MODS CARREGADA")
    }
    async init() {
        await this.updateModList('');
        this.initConfirmDownloadBtn();
        this.initCancelDownloadBtn();
        this.initCloseBtn();
        this.initSearch();
    }

    private searchMods = async (query: string): Promise<SearchResultHit[]> => {
        try {
            const results = await this.client.searchProjects({
                query: query,
                facets: '[["project_type:mod"]]',
                limit: 300,
            });
            return results.hits;
        } catch (error) {
            console.error("Erro ao buscar mods:", error);
            return [];
        }
    }

    private initSearch() {
        const searchInput = document.getElementById('mods-search') as HTMLInputElement;
        searchInput.addEventListener('input', async () => {
            const query = searchInput.value.trim();
            await this.updateModList(query);
        });
    }

    private async getMinecraftInstances() {
        const launcherSettings = await LauncherSettings.config()
        if (!launcherSettings) return this.notification("Algo deu errado, tente reiniciar o Launcher com permisões de administrador.")
        let instances = await ipcRenderer.invoke('getInstances', launcherSettings.path + '\\instances')
        return instances
    }


    initCloseBtn = () => {
        const closeButton = document.getElementById('close-mod-install') as HTMLButtonElement;
        closeButton.addEventListener('click', () => {
            const modInstallModal = document.getElementById('mod-install-modal') as HTMLDivElement;
            modInstallModal.classList.remove('flex');
            modInstallModal.classList.add('hidden');
        });
    }

    initCancelDownloadBtn = () => {
        const cancelButton = document.getElementById('cancel-mod-install') as HTMLButtonElement;
        cancelButton.addEventListener('click', () => {
            const modInstallModal = document.getElementById('mod-install-modal') as HTMLDivElement;
            modInstallModal.classList.remove('flex');
            modInstallModal.classList.add('hidden');
        });
    }

    initConfirmDownloadBtn = () => {
        const confirmButton = document.getElementById('confirm-mod-install') as HTMLButtonElement;
        confirmButton.addEventListener('click', async () => await this.dowloadMod());
        const modInstallModal = document.getElementById('mod-install-modal') as HTMLDivElement;
        modInstallModal.classList.remove('flex');
        modInstallModal.classList.add('hidden');
    }

    updateModList = async (query: string) => {
        const modListContainer = document.getElementById('mods-list') as HTMLDivElement;
        modListContainer.innerHTML = 'Carregando...';
        const mods = await this.searchMods(query);
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

            const downloadButton = document.getElementById(`download-${i}`) as HTMLButtonElement;
            downloadButton.addEventListener('click', async () => {
                const modInstallModal = document.getElementById('mod-install-modal') as HTMLDivElement;
                modInstallModal.classList.remove('hidden');
                modInstallModal.classList.add('flex');

                const versionSelect = document.getElementById('install-game-version') as HTMLSelectElement;
                const loaderSelect = document.getElementById('install-loader') as HTMLSelectElement;
                const profileSelect = document.getElementById('install-profile') as HTMLSelectElement;
                const modData = await this.client.getProject(mod.slug);

                versionSelect.options.length = 0;
                loaderSelect.options.length = 0;
                modData.game_versions.reverse();
                modData.game_versions.forEach((version) => {
                    versionSelect.options.add(new Option(version, version));
                })

                modData.loaders.forEach((loader) => {
                    loaderSelect.options.add(new Option(loader, loader));
                });

                const instances = await this.getMinecraftInstances();
                profileSelect.options.length = 0;
                profileSelect.options.add(new Option('Não instalar em nenhum perfil', ''));
                instances.forEach((instance: string) => {
                    profileSelect.options.add(new Option(instance, instance));
                });

                this.selectedModId = mod.slug;
            });
        });
    }

    dowloadMod = async () => {
        try {
            const modId = this.selectedModId;
            if (!modId) {
                this.notification("Nenhum mod selecionado para download.");
                return;
            }
            const mod = await this.client.getProject(modId);
            const versions = await this.client.getProjectVersions(modId);

            if (versions.length === 0) {
                this.notification("Nenhuma versão compatível encontrada para os critérios selecionados.");
                return;
            }
            const latestVersion = versions[0];
            if (latestVersion.files.length === 0) {
                this.notification("Nenhum arquivo encontrado para a versão do mod: " + latestVersion.name);
                return;
            }

            const downloadLoadingModal = document.getElementById('download-animation') as HTMLDivElement;
            downloadLoadingModal.classList.remove('hidden');
            downloadLoadingModal.classList.add('relative');

            const versionSelect = document.getElementById('install-game-version') as HTMLSelectElement;
            const loaderSelect = document.getElementById('install-loader') as HTMLSelectElement;
            const profileSelect = document.getElementById('install-profile') as HTMLSelectElement;

            const dowloadUrl: string = `https://api.modrinth.com/v2/project/${mod.slug}/version`;
            const res = await fetch(dowloadUrl);

            const versionsData = await res.json();

            const versao = versionsData.find((v: any) =>
                v.game_versions.includes(versionSelect.value) &&
                v.loaders.includes(loaderSelect.value)
            );

            if (!versao) {
                this.notification("Nenhuma versão compatível encontrada para os critérios selecionados.");
                return;
            }

            const arquivo = versao.files[0];
            const modD = await fetch(arquivo.url);
            const buffer = await modD.arrayBuffer();

            const path = await LauncherSettings.config()

            const instancesPath = profileSelect.value ? join(path!.path, 'instances', profileSelect.value) : path!.path;

            if (!fs.existsSync(join(instancesPath, 'mods'))) {
                fs.mkdirSync(join(instancesPath, "mods"), { recursive: true });
            }

            fs.writeFileSync(join(instancesPath, "mods", arquivo.filename), Buffer.from(buffer));
            this.notification(`Mod ${mod.title} baixado com sucesso para o diretorio ${join(instancesPath, "mods")}`);
            downloadLoadingModal.classList.add('hidden');
            downloadLoadingModal.classList.remove('relative');


        } catch (error) {
            console.error("Erro ao baixar o mod:", error);
        }
    }
}

export {
    ModsPage
}