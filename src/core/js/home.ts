import axios from "axios"
import { Launcher } from "./launcher.js"
import LauncherDB from "../../db/launcher.js";
import { FabricAPI, MineAPI, QuiltAPI, NeoForgeAPI } from "../../interfaces/launcher.js"
import { AutoUpdater } from "./autoupdater.js"
import { ipcRenderer } from "electron"
import { PageBase } from "../base.js"
import { Microsoft } from "minecraft-java-core";
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
        this.initUpdater()
        const play = document.getElementById('play') as HTMLButtonElement
        play.addEventListener('click', () => {
            this.startLauncher()
            play.innerHTML = '<span class="material-icons">play_disabled</span> Instalando...'
            play.disabled = true
        });
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
        div.addEventListener('click', () => this.setDropdownItem(div.innerHTML.split('>')[1]))
        return div
    }

    private setDropdownItem(item: string) {
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

    startLauncher() {
        const [type, version] = (document.getElementById('version') as HTMLInputElement).value.split(' ')
        const launcher = new Launcher()
        launcher.init(version, type)


        const barra = document.getElementById('barra') as HTMLElement
        barra.style.padding = "0.25rem"

        launcher.on("progress", (progress: any, size: any, element: any) => {
            const porcentagem = Math.round((progress / size) * 100)
            barra.innerHTML = `Baixando ${element} | ${porcentagem}% | ${(progress / 1024).toFixed(2)}/${(size / 1024).toFixed(2)} MB`
            barra.style.width = `${porcentagem}%`
        })

        launcher.on("check", (progress: any, size: any, element: any) => {
            const porcentagem = Math.round((progress / size) * 100)
            barra.innerHTML = `Checando ${element} | ${porcentagem}% | ${(progress / 1024).toFixed(2)}/${(size / 1024).toFixed(2)} MB`
            barra.style.width = `${porcentagem}%`
        })

        launcher.on("error", (err: any) => {
            barra.innerHTML = `<span class="text-red-700">${JSON.stringify(err)}</span>`
            barra.style.width = `100%`
            barra.style.padding = "0.25rem"
            console.log(err)
        })

        launcher.on('data', (data: any) => {
            console.log(data)
            barra.innerHTML = '<span class="text-lime-700">Iniciando JVM e o Minecraft</span>'
            barra.style.width = '100%'
            if (data.includes("Launching")) {
                barra.innerHTML = '<span class="text-lime-700">Jogo rodando...</span>'
                ipcRenderer.invoke("playing", `${type} ${version}`)
            }
        })

        launcher.on('close', (code: number) => {
            barra.style.width = '0%'
            barra.style.padding = "0px"
            const play = document.getElementById('play') as HTMLButtonElement
            play.disabled = false
            play.innerHTML = '<span class="material-icons">play_circle</span> Instalar e Jogar'
            ipcRenderer.invoke("stopPlaying")
        })
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