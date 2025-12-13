import { PageBase } from "../base.js";
import { Mojang } from "minecraft-java-core";
import { AccountCreate } from "../../interfaces/launcher.js";
import Account from "../../db/account.js";
import { ipcRenderer } from "electron";
import sharp from "sharp";

class AccountsPage extends PageBase {

    constructor() {
        super({
            pageName: 'accounts'
        })
        console.log("[CLIENT SIDE] GERENCIADOR DE CONTAS CARREGADO")


    }

    async init() {
        await this.listAccounts()
        this.openNewElyByAccMenu()
        this.closeNewElyByAccMenu()
        this.openNewaccMenu()
        this.closeNewaccMenu()
        await this.createAccount()
    }


    async selectAccount(id: number) {
        const atual = await Account.getAtual()

        await Account.update(atual?.id as number, {
            selected: false
        })

        const upacc = await Account.update(id, {
            selected: true
        })

        if (upacc) {
            this.notification(`Conta ${upacc.name} selecionada!`)
            await this.setupSidebarAccountInfo(upacc)
        }
    }

    async deleteAccount(id: number, div: HTMLDivElement, removeBtn?: HTMLButtonElement) {
        try {
            const acc = await Account.getById(id)
            if (acc?.selected) return this.notification('Você não pode remover a conta que você está usando')
            const lengthacc = await Account.accounts()
            if (!lengthacc) {
                const sideUsername = document.getElementById('side-username') as HTMLElement
                sideUsername.innerHTML = 'Não logado'
                const sideAvatar = document.getElementById('side-avatar') as HTMLImageElement
                sideAvatar.src = '../core/imgs/steve.png'
            }
            const list = document.getElementById('acc-list') as HTMLElement
            if (list.contains(div)) list.removeChild(div)
            else {
                const div2 = document.getElementById(`${id}_div`)
                div2?.remove()
            }
            await Account.delete(id)
            this.notification(`Conta ${acc?.name} excluída!`)
        } catch (e) {
            this.notification('Algo deu errado ' + e)
        }

    }

    async updateList(name: string, id: number, accountType: "Local" | "Microsoft" | "Ely.by") {
        const list = document.getElementById('acc-list') as HTMLElement
        const div = await this.returnAccountCard(name, id, accountType)
        list.insertBefore(div, list.lastChild)
        const selecBtn = document.getElementById(`${id}_add`) as HTMLButtonElement;
        selecBtn.addEventListener("click", async () => await this.selectAccount(id));
        const removeBtn = document.getElementById(`${id}_remove`) as HTMLButtonElement;
        removeBtn.addEventListener("click", async () => await this.deleteAccount(id, div, removeBtn));
    }
    async listAccounts() {
        // console.log('Listando contas...')
        const oldList = document.getElementById('acc-list') as HTMLElement
        const accounts = await Account.accounts()
        if (!accounts.length) oldList.innerHTML += '<p>Ops, você não tem nenhuma conta adicionada 😭</p>'
        for (let account of accounts) {
            switch (account.type) {
                case "Local":
                    this.accsHeadsByName.set(account.name, '../core/imgs/local.png');
                    break;
                case "Microsoft":
                    this.accsHeadsByName.set(account.name, `https://mc-heads.net/avatar/${account.name}/100/nohelm.png`);
                    break
                case "Ely.by":
                    const elyHead = await this.cropHeadFromSkinFile(`http://skinsystem.ely.by/skins/${account.name}.png`) || '../core/imgs/elyby.png'
                    this.accsHeadsByName.set(account.name, elyHead);
                    break
            }

            if (account.selected) await this.setupSidebarAccountInfo(account)

            const list = document.getElementById('acc-list') as HTMLElement
            const card = await this.returnAccountCard(account.name, account.id, account.type)
            list.appendChild(card)
            const checkExist = setInterval(() => {
                const selecBtn = document.getElementById(`${account.id}_add`) as HTMLButtonElement;
                const removeBtn = document.getElementById(`${account.id}_remove`) as HTMLButtonElement;
                if (selecBtn && removeBtn) {
                    selecBtn.addEventListener("click", async () => await this.selectAccount(account.id));
                    removeBtn.addEventListener("click", async () => await this.deleteAccount(account.id, card));
                    clearInterval(checkExist);
                } else console.log('Prourando conta')
            }, 100);

        }

        const buttonsDiv = document.createElement('div')
        buttonsDiv.classList.add('flex', 'flex-row', 'gap-2', 'itents-center')
        oldList.appendChild(buttonsDiv)

        const addLocalaAcc = `
        <button id="add-acc" class="play-btn"><span class="material-icons mr-1">create_new_folder</span> Criar conta local</button>
    `

        const addMicrosoftAcc = `
        <button id="microsoft-login-btn" class="microsoft-btn"><svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24" viewBox="0 0 48 48">
<path fill="#ff5722" d="M6 6H22V22H6z" transform="rotate(-180 14 14)"></path><path fill="#4caf50" d="M26 6H42V22H26z" transform="rotate(-180 34 14)"></path><path fill="#ffc107" d="M26 26H42V42H26z" transform="rotate(-180 34 34)"></path><path fill="#03a9f4" d="M6 26H22V42H6z" transform="rotate(-180 14 34)"></path>
</svg> Login com Microsoft</button>
    `

        const addElybyAcc = `<button id="elyby-login-btn" class="elyby-btn"><?xml version="1.0" encoding="utf-8"?><!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
<svg width="24px" height=24px" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><defs><style>.a{fill:none;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;}</style></defs><path class="a" d="M40.5,5.5H7.5a2,2,0,0,0-2,2v33a2,2,0,0,0,2,2h33a2,2,0,0,0,2-2V7.5A2,2,0,0,0,40.5,5.5Z"/><path class="a" d="M28.8315,28.5616A5.5586,5.5586,0,0,1,24,31.3677h0a5.56,5.56,0,0,1-5.5605-5.56V22.1928A5.56,5.56,0,0,1,24,16.6323h0a5.56,5.56,0,0,1,5.5605,5.56V24H18.44"/></svg> Login com Elyby</button>`

        buttonsDiv.innerHTML += addLocalaAcc
        buttonsDiv.innerHTML += addMicrosoftAcc
        buttonsDiv.innerHTML += addElybyAcc
    }



    private async returnAccountCard(name: string, id: number, accountType: "Local" | "Microsoft" | "Ely.by") {

        // console.log(this.accsHeadsByName.get('Mateus2'), name);


        const div = document.createElement('div')
        div.classList.add('flex', 'flex-col', 'bg-zinc-900', 'shadow-sm', 'p-2', 'w-96', 'gap-y-3', 'rounded', 'hover:scale-105', 'duration-200')
        div.id = `${id}_div`
        const content = `
        <div class="flex gap-x-3">
        <img src="${this.accsHeadsByName.get(name)}" width="50">
           
            <div class="flex flex-col">
                <p id="acc-username">${name}</p>
                <p class="text-xs mb-2">Conta ${accountType}</p>
            </div>
        </div>
        <div class="flex gap-2">
            <button class="text-xs bg-green-500 py-0.5 px-1 flex items-center" id="${id}_add"><span class="material-icons mr-1">done</span> Escolher conta</button>
            <button class="text-xs bg-red-500 py-0.5 px-1 flex items-center" id="${id}_remove"><span class="material-icons mr-1" >remove_circle</span> Remover conta</button>
        </div>
        `
        div.innerHTML += content
        return div
    }

    openNewElyByAccMenu() {
        const activebtn = document.getElementById('elyby-login-btn') as HTMLButtonElement
        activebtn.addEventListener('click', () => {
            const menu = document.getElementById('acc-menu-elyby') as HTMLElement
            menu.classList.add('flex')
            menu.classList.remove('hidden')
        })
    }

    closeNewElyByAccMenu() {
        const closebtn = document.getElementById('close-menu-ely') as HTMLButtonElement
        closebtn.addEventListener('click', () => {
            const menu = document.getElementById('acc-menu-elyby') as HTMLElement
            menu.classList.add('hidden')
            menu.classList.remove('flex')
        })
    }

    openNewaccMenu() {
        const activebtn = document.getElementById('add-acc') as HTMLButtonElement
        activebtn.addEventListener('click', () => {
            const menu = document.getElementById('acc-menu') as HTMLElement
            menu.classList.add('flex')
            menu.classList.remove('hidden')
        })
    }

    closeNewaccMenu() {
        const closebtn = document.getElementById('close-menu') as HTMLButtonElement
        closebtn.addEventListener('click', () => {
            const menu = document.getElementById('acc-menu') as HTMLElement
            menu.classList.add('hidden')
            menu.classList.remove('flex')
        })
    }

    async createAccount() {
        const createbtn = document.getElementById('create-btn') as HTMLButtonElement
        const microsoftbtn = document.getElementById('microsoft-login-btn') as HTMLButtonElement
        const elybybtn = document.getElementById('create-btn-ely') as HTMLButtonElement

        elybybtn.addEventListener('click', async () => {

            const menu = document.getElementById('acc-menu-elyby') as HTMLElement
            menu.classList.add('hidden')
            menu.classList.remove('flex')

            const username = (document.getElementById('elyby-username') as HTMLInputElement).value
            const password = (document.getElementById('elyby-password') as HTMLInputElement).value
            try {
                const data = await fetch('https://authserver.ely.by/auth/authenticate', {
                    method: "POST",
                    body: JSON.stringify({
                        username, password,
                        requestUser: true
                    })
                })

                const json = await data.json()

                const jsonFormatted = {
                    access_token: json.accessToken,
                    client_token: json.clientToken,
                    uuid: json.user.id,
                    name: json.user.username,
                    user_properties: json.user.properties[0],
                    meta: {
                        type: 'ely'
                    },
                    type: 'Ely.by',
                }
                Account.create(jsonFormatted)
                    .then(async data => {
                        const atual = await Account.getAtual()
                        if (!atual) {
                            Account.update(data.id, {
                                selected: true
                            })
                            await this.setupSidebarAccountInfo(data)
                        }
                        const elyHead = await this.cropHeadFromSkinFile(`http://skinsystem.ely.by/skins/${data.name}.png`) || '../core/imgs/elyby.png'
                        this.accsHeadsByName.set(data.name, elyHead);
                        this.updateList(data.name, data.id, 'Ely.by')
                        this.notification('Conta criada!')
                    })
                    .catch(e => {
                        this.notification("Não foi possivel adicionar sua conta, tente novamente executando o BRLauncher como administrador.")
                    })
            } catch (e) {
                this.notification('Erro ao autenticar com Ely.By, desculpa.')
            }
        })

        microsoftbtn.addEventListener('click', async () => {
            const acc = await ipcRenderer.invoke("loginMicrosoft");
            if (acc.error) {
                this.notification('Falha ao logar com Microsoft: Parece que você não tem o minecraft comprado nessa conta.')
                return;
            }
            if (!acc) return this.notification('A solicitação de login não foi concluída.');
            acc.type = 'Microsoft'
            Account.create(acc)
                .then(async data => {
                    const atual = await Account.getAtual()
                    if (!atual) {
                        Account.update(data.id, {
                            selected: true
                        })
                        await this.setupSidebarAccountInfo(data)
                    }
                    this.accsHeadsByName.set(data.name, `https://mc-heads.net/avatar/${data.name}/100/nohelm.png`);
                    this.updateList(data.name, data.id, 'Microsoft')
                    this.notification('Conta Microsoft adicionada!')
                })
                .catch(e => this.notification("Não foi possivel adicionar sua conta, tente novamente executando o BRLauncher como administrador."))
            const menu = document.getElementById('acc-menu') as HTMLElement
            menu.classList.add('hidden')
            menu.classList.remove('flex')
        })


        createbtn.addEventListener('click', async () => {
            const username = (document.getElementById('new-acc-username') as HTMLInputElement).value
            if (!username) return this.notification('Escreva algo!')
            const auth = await Mojang.login(username) as AccountCreate
            if (!auth) return;
            auth.type = 'Local'
            Account.create(auth)
                .then(async data => {
                    const atual = await Account.getAtual()
                    if (!atual) {
                        Account.update(data.id, {
                            selected: true
                        })
                        await this.setupSidebarAccountInfo(data)
                    }
                    this.accsHeadsByName.set(data.name, '../core/imgs/local.png');
                    this.updateList(data.name, data.id, 'Local')
                    this.notification('Conta criada!')
                })
                .catch(() => this.notification("Não foi possivel criar sua conta, tente novamente executando o BRLauncher como administrador."))
            const menu = document.getElementById('acc-menu') as HTMLElement
            menu.classList.add('hidden')
            menu.classList.remove('flex')
        })
    }

    async cropHeadFromSkinFile(skinURL: string) {

        try {
            console.log('Baixando skin...');

            const response = await fetch(skinURL, {
                cache: 'no-cache'
            });

            if (!response.ok) return this.notification('Erro ao baixar a skin do servidor: ' + response.statusText);

            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const faceBase = await sharp(buffer)
                .extract({ left: 8, top: 8, width: 8, height: 8 })
                .toBuffer();

            const faceOverlay = await sharp(buffer)
                .extract({ left: 40, top: 8, width: 8, height: 8 })
                .toBuffer();

            const base64Image = await sharp(faceBase)
                .composite([{ input: faceOverlay }])
                .resize(128, 128, { kernel: sharp.kernel.nearest })
                .png()
                .toBuffer()
                .then((finalBuffer) => finalBuffer.toString('base64'));

            console.log(`data:image/png;base64,${base64Image}`);
            return `data:image/png;base64,${base64Image}`;

        } catch (error) {
            this.notification('Erro ao processar a skin: ' + error);
        }
    }

    async setupSidebarAccountInfo(data: AccountCreate) {
        const sideUsername = document.getElementById('side-username') as HTMLElement
        sideUsername.innerHTML = data.name
        const sideAvatar = document.getElementById('side-avatar') as HTMLImageElement
        const iconUrl = this.accsHeadsByName.get(data.name)
        sideAvatar.src = iconUrl || '../core/imgs/steve.png'
    }
}

export {
    AccountsPage
}