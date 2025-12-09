import { PageBase } from "../base.js";
import Launcher from "../../db/launcher.js";
import os from "os"
import { ipcRenderer } from "electron";

class ConfigPage extends PageBase {
    constructor() {
        super({
            pageName: 'config'
        })
        console.log("[CLIENT SIDE] CLASSE DA TELA DE CONFIGURAÇÕES CARREGADA")
    }

    async init() {
        if (!(await Launcher.config())) {
            try {
                await Launcher.resetConfig()
            } catch {
                this.notification("Não foi possivel escrever no banco de dados, tente executar o BRLauncher como administrador.")
            }
        }
        await this.startConfig()
        await this.initEvents()
    }

    async startConfig() {
        const data = await Launcher.config()
        if (!data) return this.notification('Algo deu <bold>extremamente</bold> errado. Aparentemente não foi possivel criar o banco de dados, para corrigir o problema, abra o BRLauncher como administrador.')

        const dirInput = document.getElementById('dir') as HTMLInputElement
        dirInput.value = data.path

        const heightInput = document.getElementById('height') as HTMLInputElement
        heightInput.value = data.height.toString()

        const widthInput = document.getElementById('width') as HTMLInputElement
        widthInput.value = data.width.toString()

        const minInput = document.getElementById('min') as HTMLInputElement
        minInput.min = '1024'
        minInput.max = Math.round((os.totalmem()) / (1020 ** 2)).toString()
        minInput.value = data.min.toString()

        const maxInput = document.getElementById('max') as HTMLInputElement
        maxInput.min = '1024'
        maxInput.max = Math.round((os.totalmem()) / (1020 ** 2)).toString()
        maxInput.value = data.max.toString()

        const maxPanel = document.getElementById('maxPanel') as HTMLDivElement
        const minPanel = document.getElementById('minPanel') as HTMLDivElement

        minPanel.innerHTML = minInput.value
        maxPanel.innerHTML = maxInput.value

        const elyBy = document.getElementById('toggleEly') as HTMLInputElement
        elyBy.checked = data.elyBy

        const elyStatus = document.getElementById('elyStatus') as HTMLSpanElement
        elyStatus.textContent = elyBy.checked ? "Ativado" : "Desativado"
        elyStatus.className = elyBy.checked ? "text-green-500" : "text-red-500"

    }

    async initEvents() { // Necessario pra não "clonar" os eventos
        const widthInput = document.getElementById('width') as HTMLInputElement
        const dirInput = document.getElementById('dir') as HTMLInputElement
        const heightInput = document.getElementById('height') as HTMLInputElement
        const minInput = document.getElementById('min') as HTMLInputElement
        const maxInput = document.getElementById('max') as HTMLInputElement
        const maxPanel = document.getElementById('maxPanel') as HTMLDivElement
        const minPanel = document.getElementById('minPanel') as HTMLDivElement
        const fileExplorer = document.getElementById('fileExplorer') as HTMLButtonElement
        const elyBy = document.getElementById('toggleEly') as HTMLInputElement

        minInput.addEventListener('input', () => minPanel.innerHTML = minInput.value)
        maxInput.addEventListener('input', () => maxPanel.innerHTML = maxInput.value)

        const saveButton = document.getElementById('salvar') as HTMLButtonElement
        saveButton.addEventListener('click', () => {
            Launcher.update(dirInput.value, parseInt(minInput.value), parseInt(maxInput.value), parseInt(widthInput.value), parseInt(heightInput.value), elyBy.checked)
                .then(() => {
                    this.notification('Configuraçõe salvas 💫')
                    this.startConfig()
                })
                .catch(() => this.notification("Não foi possivel escrever no banco de dados, tente executar o BRLauncher como administrador."))
        })

        const resetButton = document.getElementById('reset') as HTMLButtonElement
        resetButton.addEventListener('click', async () => {
            Launcher.resetConfig()
                .then(() => {
                    this.notification('Configurações resetadas 🗑️')
                    this.startConfig()
                })
                .catch(() => this.notification("Não foi possivel escrever no banco de dados, tente executar o BRLauncher como administrador."))
        })

        fileExplorer.addEventListener('click', async () => {
            const path = await ipcRenderer.invoke('fileExplorer') as string[] | undefined
            if (!path) return 0;
            dirInput.value = path[0]
        })
    }
}

export {
    ConfigPage
}