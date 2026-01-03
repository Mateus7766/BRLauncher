import { PageBase } from "../base";
import { ModrinthV2Client, SearchResultHit } from "@xmcl/modrinth";
import { ipcRenderer, shell } from "electron";
import LauncherSettings from "../../db/launcher";
import { join } from "path";
import fs from "fs";
import { MineAPI } from "../../interfaces/launcher";
import { readFabricMod, readForgeMod } from "@xmcl/mod-parser";
import { ModInfo } from "../../interfaces/launcher";


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
        this.initSelectProfile();
        this.getInstalledMods();
        this.initConfirmDownloadBtn();
        this.initCancelDownloadBtn();
        this.initCloseBtn();
        this.initSearch();
        this.moveToLocalMods();
    }

    private searchMods = async (query: string): Promise<SearchResultHit[]> => {
        try {
            const versionInput = document.getElementById('filter-version') as HTMLSelectElement;
            const loaderInput = document.getElementById('filter-loader') as HTMLSelectElement;
            const sort = document.getElementById('filter-sort') as HTMLSelectElement;

            const facets: string[][] = [
                ["project_type:mod"]
            ];

            // if (sort.value) {
            //     facets.push([`sort:${sort.value}`]);
            // }

            if (versionInput.value) {
                facets.push([`versions:${versionInput.value}`]);
            }

            if (loaderInput.value) {
                facets.push([`categories:${loaderInput.value}`]);
            }

            const facetString = JSON.stringify(facets);

            const results = await this.client.searchProjects({
                query: query,
                facets: facetString,
                index: sort.value || 'relevance',
                limit: 300,
            });
            return results.hits;
        } catch (error) {
            console.error("Erro ao buscar mods:", error);
            return [];
        }
    }

    private async getVanillaVersions() { // Importado do Home.ts
        let vanilla = (await (await fetch("https://piston-meta.mojang.com/mc/game/version_manifest_v2.json")).json() as MineAPI).versions.filter(v => v.type === "release").map(v => v.id)
        return vanilla
    }

    private async initSearch() {

        const mineVersions = await this.getVanillaVersions();



        const searchInput = document.getElementById('mods-search') as HTMLInputElement;
        const versionInput = document.getElementById('filter-version') as HTMLSelectElement;
        const sort = document.getElementById('filter-sort') as HTMLSelectElement;

        sort.addEventListener('change', async () => {
            const query = searchInput.value.trim();
            await this.updateModList(query);
        });

        mineVersions.forEach((version) => {
            versionInput.options.add(new Option(version, version));
        });

        const loaderInput = document.getElementById('filter-loader') as HTMLSelectElement;

        searchInput.addEventListener('input', async () => {
            const query = searchInput.value.trim();
            await this.updateModList(query);
        });

        versionInput.addEventListener('change', async () => {
            const query = searchInput.value.trim();
            await this.updateModList(query);
        });

        loaderInput.addEventListener('change', async () => {
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
            modElement.id = `mod-${mod.slug}`;
            modElement.classList.add('flex', 'mod-item', 'p-4', 'border', 'border-zinc-800', 'hover:shadow-lg', 'cursor-pointer', 'bg-zinc-900', 'rounded-md', 'mb-2', 'items-center', 'space-x-4');
            modElement.innerHTML = `
                <img src="${mod.icon_url}" alt="${mod.title} Icon" class="w-16 h-16 rounded-md mb-2">
                <div class="flex-1">
                    <h3 class="text-lg font-bold">${mod.title}</h3>
                    <p class="text-sm text-gray-600">${mod.description}</p>
                </div>
                <button class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md flex items-center gap-2 justify-center" id="download-${i}"><span class="material-icons">download</span> Download</button>
            `;
            modListContainer.appendChild(modElement);

            modElement.addEventListener('click', () => {
                shell.openExternal(`https://modrinth.com/mod/${mod.slug}`);
            });

            const downloadButton = document.getElementById(`download-${i}`) as HTMLButtonElement;
            downloadButton.addEventListener('click', async (e) => {
                e.stopPropagation();
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

    moveToLocalMods = () => {
        const hrefMod = document.getElementById('href-mods') as HTMLAnchorElement
        hrefMod.addEventListener('click', () => {
            const el = document.getElementById("installed-mods-title")
            if (el) el.scrollIntoView({
                behavior: 'smooth'
            });
        });
    }

    dowloadMod = async () => {
        try {
            const downloadLoadingModal = document.getElementById('loading') as HTMLDivElement;
            const loadingText = document.getElementById('loading-text') as HTMLParagraphElement;

            loadingText.innerHTML = 'Iniciando download...';
            downloadLoadingModal.classList.remove('hidden');
            downloadLoadingModal.classList.add('flex');

            const modId = this.selectedModId;
            if (!modId) {
                this.notification("Nenhum mod selecionado para download.");
                downloadLoadingModal.classList.add('hidden');
                downloadLoadingModal.classList.remove('flex');
                return;
            }

            const mod = await this.client.getProject(modId);


            loadingText.innerHTML = `Baixando o mod ${mod.title}...`;


            const versions = await this.client.getProjectVersions(modId);

            if (versions.length === 0) {
                this.notification("Nenhuma versão compatível encontrada para os critérios selecionados.");
                downloadLoadingModal.classList.add('hidden');
                downloadLoadingModal.classList.remove('flex');
                return;
            }
            const latestVersion = versions[0];
            if (latestVersion.files.length === 0) {
                this.notification("Nenhum arquivo encontrado para a versão do mod: " + latestVersion.name);
                downloadLoadingModal.classList.add('hidden');
                downloadLoadingModal.classList.remove('flex');
                return;
            }

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
                downloadLoadingModal.classList.add('hidden');
                downloadLoadingModal.classList.remove('flex');
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
            this.notification(`Mod ${mod.title} baixado com sucesso.`);
            this.refreshMods();
            downloadLoadingModal.classList.add('hidden');
            downloadLoadingModal.classList.remove('flex');


        } catch (error) {
            console.error("Erro ao baixar o mod:", error);
            const downloadLoadingModal = document.getElementById('loading') as HTMLDivElement;
            downloadLoadingModal.classList.add('hidden');
            downloadLoadingModal.classList.remove('flex');
        }
    }

    async initSelectProfile() {
        const profileSelect = document.getElementById('installed-mods-profile') as HTMLSelectElement;

        profileSelect.options.length = 0;
        profileSelect.options.add(new Option('Perfil Padrão', ''));
        const instances = await this.getMinecraftInstances();
        instances.forEach((instance: string) => {
            profileSelect.options.add(new Option(instance, instance));
        });

        profileSelect.addEventListener('change', async () => {
            await this.getInstalledMods(profileSelect.value);
        });
    }


    async getInstalledMods(instanceName?: string) {

        // console.log("Instancia selecionada para ver mods:", instanceName);

        const path = await LauncherSettings.config();
        if (!path) return;

        const modsPath = instanceName
            ? join(path.path, 'instances', instanceName, "mods")
            : join(path.path, "mods");

        const container = document.getElementById(
            "installed-mods-list"
        ) as HTMLDivElement;

        container.innerHTML = "";

        fs.readdir(modsPath, async (err, files) => {
            if (err) {
                console.error("Erro ao ler o diretório de mods:", err);
                return;
            }

            for (const file of files) {
                const isDisabled = file.endsWith(".disabled");
                const isValid = file.endsWith(".jar") || isDisabled;
                if (!isValid) continue;

                const filePath = join(modsPath, file);
                const realName = isDisabled
                    ? file.replace(".disabled", "")
                    : file;

                let modInfo: ModInfo = {
                    loader: "unknown",
                    name: realName.replace(".jar", ""),
                    version: "unknown",
                    file,
                    filePath,
                    enabled: !isDisabled
                };

                if (!isDisabled) {
                    const buffer = fs.readFileSync(filePath);

                    try {
                        const fabric = await readFabricMod(buffer);
                        modInfo = {
                            ...modInfo,
                            loader: "fabric",
                            id: fabric.id,
                            name: fabric.name,
                            version: fabric.version,
                            description: fabric.description,
                            icon: fabric.icon
                        };
                    } catch { }

                    if (modInfo.loader === "unknown") {
                        try {
                            const forge = await readForgeMod(buffer);
                            const mod = forge.modAnnotations.find(m => m.modId);
                            if (mod) {
                                modInfo = {
                                    ...modInfo,
                                    loader: "forge",
                                    id: mod.modId,
                                    name: mod.displayName,
                                    version: mod.version,
                                    description: mod.description,
                                    logo: mod.logoFile
                                };
                            }
                        } catch { }
                    }
                }

                this.createInstalledModElement(modInfo);
            }
        });
    }


    createInstalledModElement(mod: ModInfo) {
        const container = document.getElementById(
            "installed-mods-list"
        ) as HTMLDivElement;

        const modEl = document.createElement("div");
        modEl.className = `
            p-3 mb-2 rounded-md border border-zinc-800 bg-zinc-900
            flex items-center justify-between gap-4
            ${!mod.enabled ? "opacity-50" : ""}
        `;

        const info = document.createElement("div");
        info.className = "flex flex-col";

        const name = document.createElement("span");
        name.className = "font-medium";
        name.innerText = mod.name || "Unknown Mod";

        const version = document.createElement("span");
        version.className = "text-sm text-zinc-400";
        version.innerText = mod.version || "";

        const logo = document.createElement("img");
        logo.className = "w-12 h-12 mr-4 rounded-md";

        const loader = document.createElement("span");
        loader.className = "text-sm text-zinc-400";
        loader.innerText = `Loader: ${mod.loader}`;

        info.append(name, version, loader);

        const actions = document.createElement("div");
        actions.className = "flex gap-2";

        const toggleBtn = document.createElement("button");
        toggleBtn.className =
            "px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700";
        toggleBtn.innerText = mod.enabled ? "Desativar" : "Ativar";
        toggleBtn.onclick = () => this.toggleMod(mod);

        const deleteBtn = document.createElement("button");
        deleteBtn.className =
            "px-2 py-1 rounded bg-red-600 hover:bg-red-500";
        deleteBtn.innerText = "Remover";
        deleteBtn.onclick = () => this.uninstallMod(mod);

        actions.append(toggleBtn, deleteBtn);
        modEl.append(info, actions);
        container.appendChild(modEl);
    }


    toggleMod(mod: ModInfo) {
        const newPath = mod.enabled
            ? mod.filePath + ".disabled"
            : mod.filePath.replace(".disabled", "");

        fs.renameSync(mod.filePath, newPath);
        this.notification(
            mod.enabled ? "Mod desativado" : "Mod ativado"
        );
        this.refreshMods();
    }

    uninstallMod(mod: ModInfo) {
        if (!confirm(`Remover o mod "${mod.name}"?`)) return;
        fs.unlinkSync(mod.filePath);
        this.notification("Mod removido com sucesso");
        this.refreshMods();
    }

    refreshMods() {
        const profileSelect = document.getElementById('installed-mods-profile') as HTMLSelectElement;
        const instanceName = profileSelect.value || undefined;
        this.getInstalledMods(instanceName);
    }
}

export {
    ModsPage
}