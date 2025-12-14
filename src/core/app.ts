import { HomePage } from "./js/home.js"
import { AccountsPage } from "./js/accounts.js"
import { PageBase } from "./base.js"
import { ConfigPage } from "./js/config.js"
import { AboutPage } from "./js/about.js"
import { ModsPage } from "./js/mods.js"
import { readFileSync } from "original-fs"
import { ipcRenderer, shell } from "electron"
import Account from "../db/account.js"
import path from "path"


class App {
    async setup() {
        console.log("[CLIENT SIDE] O CLASSE PRINCIPAL DO APP FOI CARREGADA")
        await this.initPages([HomePage])
        await this.initPages([AccountsPage])
        await this.initPages([ConfigPage])
        await this.initPages([AboutPage])
        await this.initPages([ModsPage])
        await this.sideBar()
        this.topBar()
        this.setPage('home')
        this.removeLoad()
    }

    private removeLoad(){
        const loading = document.getElementById('loading') as HTMLDivElement
        loading.remove()
    }

    private async initPages<T extends PageBase>(pages: (new () => T)[]) {
        const pagesDiv = document.getElementById('content') as HTMLElement
        for (let Page of pages) {
            const page = new Page()
            const pageContent = readFileSync(path.join(__dirname.replace('core', ''), 'pages', 'partials', `${page.pageName}.html`), 'utf-8')
            const pageDiv = document.createElement("div")
            pageDiv.classList.add('w-full', 'h-full', 'hidden')
            pageDiv.id = page.pageName
            pageDiv.innerHTML = pageContent
            pagesDiv.appendChild(pageDiv)
            await page.init()
        }
       
    }
    setPage(pageName: string) {
        const page = document.getElementById(pageName) as HTMLElement
        const active = document.querySelector(".block")
        active?.classList.add('hidden')
        active?.classList.remove('block')
        page.classList.add('block')
        page.classList.remove('hidden')
        ipcRenderer.invoke('changedPage', pageName.replace('home', 'Tela Inicial').replace('accounts', 'Configurando Contas').replace('config', 'Configurando o Launcher').replace('about', 'Lendo o About').replace('mods', 'Tela de Mods'))
    }

    async sideBar() {
        const sideUsername = document.getElementById('side-username') as HTMLElement
        const sidebar = document.getElementById('sidebar') as HTMLElement
        const sideBarButtons = sidebar.querySelectorAll(".sidebar-button") as NodeListOf<HTMLButtonElement>
        sideBarButtons.forEach((button) => {
            button.addEventListener("click", (event) => {
                (sidebar.querySelector(".sidebar-active") as HTMLButtonElement).classList.remove("sidebar-active")
                button.classList.add("sidebar-active")
            })
        })

        const acc = await Account.getAtual()
        if(!acc) sideUsername.innerHTML = 'Não logado'
        else sideUsername.innerHTML = acc.name

    }

    topBar() {
        const mods_btn = document.getElementById('mods-btn') as HTMLButtonElement
        mods_btn.addEventListener('click', () => this.setPage('mods'))

        const about_btn = document.getElementById('about-btn') as HTMLButtonElement
        about_btn.addEventListener('click', () => this.setPage('about'))

        const home_btn = document.getElementById('home-btn') as HTMLButtonElement
        home_btn.addEventListener('click', () => this.setPage('home'))

        const config_btn = document.getElementById('config-btn') as HTMLButtonElement
        config_btn.addEventListener('click', () => this.setPage('config'))

        const minimize = document.getElementById("minimize") as HTMLElement;
        const maxmize = document.getElementById("maxmize") as HTMLElement;
        const accounts = document.getElementById('accounts-btn') as HTMLButtonElement
        const close = document.getElementById("close") as HTMLElement;

       
        minimize.addEventListener("click", () => ipcRenderer.invoke("minimize"));
        close.addEventListener("click", () => window.close());
        maxmize.addEventListener("click", () => ipcRenderer.invoke("maxmize"));
        accounts.addEventListener('click', () => this.setPage('accounts'))

    }
}

window.addEventListener("DOMContentLoaded", async () => {
    await (new App()).setup()
})