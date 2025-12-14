import { Launcher } from "./launcher.js"
import LauncherSettings from "../../db/launcher.js";
import { FabricAPI, MineAPI, QuiltAPI, NeoForgeAPI } from "../../interfaces/launcher.js"
import { AutoUpdater } from "./autoupdater.js"
import { ipcRenderer } from "electron"
import { PageBase } from "../base.js"
import { console } from "node:inspector";
class HomePage extends PageBase {
    constructor() {
        super({
            pageName: 'home'
        })
        console.log("[CLIENT SIDE] A HOME FOI CARREGADA");
    }

    async init() {
        await this.manageDropdown()

        const instances = await this.getMinecraftInstances()
        this.setDropdownInstances(instances || [])

        this.manageProfiles()

        this.initUpdater()
        const play = document.getElementById('play') as HTMLButtonElement

        play.addEventListener('click', () => {
            this.startLauncher()
            play.innerHTML = '<span class="material-icons">play_disabled</span> Instalando...'
            play.disabled = true
        });

        const settings = await LauncherSettings.config()
        if (!settings) return
        console.log('Última versão usada:', settings.lastUsed);
        if (settings.lastUsed) {
            await this.setDropdownItem(settings.lastUsed)
        }
    }


    manageProfiles() {
        const addProfileMenu = document.getElementById('add-profile-menu') as HTMLDivElement
        const openMenuButton = document.getElementById('add-profile') as HTMLButtonElement
        const closeMenuButton = document.getElementById('close-add-profile-menu') as HTMLButtonElement
        const confirmAddProfileButton = document.getElementById('confirm-add-profile') as HTMLButtonElement

        const deleteProfileButton = document.getElementById('delete-profile') as HTMLButtonElement

        deleteProfileButton.addEventListener('click', async () => {

            const profileInput = document.getElementById('profile') as HTMLInputElement
            const profileName = profileInput.value.trim()
            if (profileName && profileName.toLowerCase() !== 'nenhum') {
                const confirmation = confirm(`Tem certeza que deseja deletar o perfil "${profileName}"? Você perderá todos os seus mundos salvos e configurações desse perfil.`)
                if (!confirmation) {
                    this.notification("Ação de deletar perfil cancelada.")
                    return
                }
                const settings = await LauncherSettings.config()
                if (!settings) return this.notification("Algo deu errado ao deletar o perfil, tente reiniciar o launcher.")
                const path = `${settings.path}\\instances\\${profileName}`
                const success = await ipcRenderer.invoke('delete-instance-folder', path)
                if (!success) return this.notification("Algo deu errado ao deletar o perfil, tente reiniciar o launcher.")

                this.notification(`Perfil "${profileName}" deletado com sucesso de ${path}!`)

                const instances = await this.getMinecraftInstances()
                this.setDropdownInstances(instances || [])
                
                profileInput.value = 'Nenhum'
                const fake = document.getElementById('fake-instance-select') as HTMLElement
                fake.innerHTML = `<span class="material-icons">folder</span>Nenhum`
                

            } else {
                this.notification("Você não pode deletar o perfil 'Nenhum', ele é a pasta raiz do jogo.")
            }
        })

        openMenuButton.addEventListener('click', () => {
            addProfileMenu.classList.remove('hidden')
            addProfileMenu.classList.add('flex')
        }
        )
        closeMenuButton.addEventListener('click', () => {
            addProfileMenu.classList.add('hidden')
            addProfileMenu.classList.remove('flex')
        }
        )
        confirmAddProfileButton.addEventListener('click', async () => {
            const profileNameInput = document.getElementById('new-profile-name') as HTMLInputElement
            const profileName = profileNameInput.value.trim().replace(/ /g, '-')
            if (profileName) {
                const settings = await LauncherSettings.config()
                if (!settings) return this.notification("Algo deu errado ao criar o perfil, tente reiniciar o launcher.")
                const path = `${settings.path}\\instances\\${profileName}`
                const success = await ipcRenderer.invoke('create-instance-folder', path)
                if (!success) return this.notification("Algo deu errado ao criar o perfil, tente reiniciar o launcher.")
                this.notification(`Perfil "${profileName}" criado com sucesso em ${success}!`)

                const instances = await this.getMinecraftInstances()
                this.setDropdownInstances(instances || [])

                profileNameInput.value = ''
                addProfileMenu.classList.add('hidden')
                addProfileMenu.classList.remove('flex')
            }
        }
        )
    }
    // private async getInstalledVersions(){
    //     const launcherSettings = await LauncherDB.config()
    //     // if(!launcherSettings) return this.notification("Algo deu errado, tente reiniciar o Launcher com permisões de administrador.")
    //     let versions = readdirSync(`${launcherSettings?.path}\\versions`)
    //     for(let version of versions){
    //         console.log(version)
    //     }

    // }

    private async getNeoForgeVersions() {
        const tempArray: string[] = [];

        (await (await fetch("https://maven.neoforged.net/api/maven/versions/releases/net/neoforged/neoforge")).json() as NeoForgeAPI).versions.map(version => {
            version = version.split(".").slice(0, 2).join(".")
            if (!tempArray.includes(version)) tempArray.push(version)
        })
        tempArray.shift()
        return tempArray
    }

    private async getQuiltVersions() {
        let quilt = (await (await fetch("https://meta.quiltmc.org/v3/versions")).json() as QuiltAPI).game.filter(v => v.stable).map(v => v.version)
        return quilt
    }

    private async getFabricVersions() {
        let fabric = (await (await fetch("https://meta.fabricmc.net/v2/versions/game")).json() as FabricAPI[]).filter(v => v.stable).map(v => v.version)
        return fabric
    }

    private async getVanillaVersions() {
        let vanilla = (await (await fetch("https://piston-meta.mojang.com/mc/game/version_manifest_v2.json")).json() as MineAPI).versions.filter(v => v.type === "release").map(v => v.id)
        return vanilla
    }

    private async getForgeVersions() {
        let forge = (await (await fetch("https://files.minecraftforge.net/net/minecraftforge/forge/maven-metadata.json")).json() as Object)
        return forge
        // https://files.minecraftforge.net/net/minecraftforge/forge/maven-metadata.json
    }

    private returnOptionElement(type: 'forge' | 'fabric' | 'vanilla' | 'quilt' | 'neoforge', version: string) {
        const div = document.createElement('div')
        div.classList.add('flex', 'items-center', 'gap-x-3', 'p-2', 'cursor-pointer', 'border-l-0', 'hover:border-l-4', 'border-red-500', 'duration-150')
        div.innerHTML = `<img src="../core/imgs/${type}.png" width="30">${type} ${version}`
        div.addEventListener('click', async () => await this.setDropdownItem(div.innerHTML.split('>')[1]))
        return div
    }

    private async setDropdownItem(item: string) {

        const fake = document.getElementById('fake-select') as HTMLElement
        fake.innerHTML = `<img src="../core/imgs/${item.split(' ')[0]}.png" width="30">${item}`
        const input = document.getElementById('version') as HTMLInputElement
        input.value = item

    }

    async manageDropdown() {
        const vanilla = await this.getVanillaVersions()
        const fabric = await this.getFabricVersions()
        const forge = await this.getForgeVersions()
        const quilt = await this.getQuiltVersions()
        const neoforge = await this.getNeoForgeVersions()

        const options = document.getElementById('options') as HTMLElement

        for (let version of vanilla) {
            const forgeDiv = this.returnOptionElement('forge', version)
            const fabricDiv = this.returnOptionElement('fabric', version)
            const vanillaDiv = this.returnOptionElement('vanilla', version)
            const quiltDiv = this.returnOptionElement('quilt', version)
            const neoforgeDiv = this.returnOptionElement('neoforge', version)


            options.appendChild(vanillaDiv)

            if (fabric.includes(version)) {
                options.appendChild(fabricDiv)
            }
            if (Object.keys(forge).includes(version)) {
                options.appendChild(forgeDiv)
            }
            if (quilt.includes(version)) {
                options.appendChild(quiltDiv)
            }
            if (neoforge.includes(version.split(".").slice(1, 3).join("."))) {
                options.appendChild(neoforgeDiv)
            }
        }
    }

    private async getMinecraftInstances() {
        const launcherSettings = await LauncherSettings.config()
        if (!launcherSettings) return this.notification("Algo deu errado, tente reiniciar o Launcher com permisões de administrador.")
        let instances = await ipcRenderer.invoke('getInstances', launcherSettings.path + '\\instances')
        return instances
    }

    private setDropdownInstances(items: string[]) {
        const instanceSelect = document.getElementById('instance-options') as HTMLElement

        items.unshift('Nenhum')

        instanceSelect.innerHTML = ''
        items.forEach(item => {
            const div = document.createElement('div')
            div.classList.add('flex', 'items-center', 'gap-x-3', 'p-2', 'cursor-pointer', 'border-l-0', 'hover:border-l-4', 'border-red-500', 'duration-150')
            div.innerHTML = `<span class="material-icons">folder</span>${item}`
            div.addEventListener('click', async () => {
                const fake = document.getElementById('fake-instance-select') as HTMLElement
                fake.innerHTML = `<span class="material-icons">folder</span>${item}`
                const input = document.getElementById('profile') as HTMLInputElement
                input.value = item
            })
            instanceSelect.appendChild(div)
        })
    }

    async startLauncher() {
        try {
            const [type, version] = (document.getElementById('version') as HTMLInputElement).value.split(' ')
            let profile = (document.getElementById('profile') as HTMLInputElement).value || undefined
            if (profile?.toLowerCase() === 'nenhum') profile = undefined

            const settings = await LauncherSettings.config();
            await LauncherSettings.update(settings.path, settings.min, settings.max, settings.width, settings.height, settings.elyBy, `${type} ${version}`)


            const launcher = new Launcher()
            launcher.init(version, type, profile)


            const barra = document.getElementById('barra') as HTMLElement
            // barra.style.padding = "0.25rem"

            launcher.on("progress", (progress: any, size: any, element: any) => {
                const porcentagem = Math.round((progress / size) * 100)
                // barra.innerHTML = `Baixando ${element} | ${porcentagem}% | ${(progress / 1024).toFixed(2)}/${(size / 1024).toFixed(2)} MB`
                barra.style.width = `${porcentagem}%`
            })

            launcher.on("check", (progress: any, size: any, element: any) => {
                const porcentagem = Math.round((progress / size) * 100)
                //barra.innerHTML = `Checando ${element} | ${porcentagem}% | ${(progress / 1024).toFixed(2)}/${(size / 1024).toFixed(2)} MB`
                barra.style.width = `${porcentagem}%`
            })

            launcher.on("error", (err: any) => {
                // barra.innerHTML = `<span class="text-red-700">${JSON.stringify(err)}</span>`
                barra.style.width = `100%`
                //barra.style.padding = "0.25rem"
                console.log(err)
            })

            launcher.on('data', (data: any) => {
                console.log(data)
                barra.style.width = '100%'
                if (data.includes("Launching")) {
                    ipcRenderer.invoke("playing", `${type} ${version}`)
                    const isPlaying = document.getElementById("playing") as HTMLDivElement
                    setTimeout(() => {
                        isPlaying.classList.remove("hidden")
                        isPlaying.classList.add("flex")
                    }, 5500);
                }
            })

            launcher.on('close', (code: number) => {
                barra.style.width = '0%'
                barra.style.padding = "0px"

                const play = document.getElementById('play') as HTMLButtonElement
                play.disabled = false
                play.innerHTML = '<span class="material-icons">play_circle</span> Instalar e Jogar'
                ipcRenderer.invoke("stopPlaying")

                const isPlaying = document.getElementById("playing") as HTMLDivElement
                isPlaying.classList.add("hidden")
                isPlaying.classList.remove("flex")
            })
        } catch (e) {
            this.notification("Ocorreu um erro ao iniciar o jogo: " + e)
        }
    }

    initUpdater() {

        const autoUpdater = new AutoUpdater()

        const updater = document.getElementById("updater") as HTMLDivElement
        const no_button = document.getElementById("nupdate") as HTMLButtonElement
        const no_button_x = document.getElementById("close-updater") as HTMLButtonElement
        const yes_button = document.getElementById("yupdate") as HTMLButtonElement

        autoUpdater.on("update-found", () => {
            updater.classList.add('flex')
            updater.classList.remove('hidden')
            console.log('Update encontrado')
        })

        autoUpdater.on("update-notavaliable", () => console.log('O launcher já está atualizado.'))

        no_button.addEventListener("click", (event) => {
            updater.classList.add('hidden')
            updater.classList.remove('flex')
        })

        no_button_x.addEventListener("click", (event) => {
            updater.classList.add('hidden')
            updater.classList.remove('flex')
        })

        yes_button.addEventListener("click", (event) => {
            yes_button.setAttribute('disabled', 'true')

            updater.classList.add('hidden')
            updater.classList.remove('flex')
            autoUpdater.downloadNewVersion()

            autoUpdater.on("finished", () => {
                this.notification("O BRLauncher foi atualizado para a versão mais recente. Reabra o launcher para ver as novidades.")
            })

            autoUpdater.on('error', (error) => {
                console.log(error)
            })
        })
    }
}

export {
    HomePage
}