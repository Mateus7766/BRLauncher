import { Launch, Microsoft } from "minecraft-java-core"
import LauncherSettings from "../../db/launcher.js"
import Account from "../../db/account.js"

class Launcher extends Launch {
    constructor() {
        super()
        console.log("[CLIENT SIDE] CLASSE LAUNCHER CARREGADA")
    }
    async init(version: string, type: string) {
        const accounts = await Account.accounts()
        if (!accounts.length) {
            alert("Você não pode jogar sem criar uma conta, vá para o menu 'Contas' para criar uma.")
            this.emit('close')
            return
        }

        const settings = await LauncherSettings.config()
        if (!settings) return

        const auth = await Account.getAtual()
        if(auth.type == "Microsoft"){
            const json = this.convert(auth)
            const newAuth = await new Microsoft('00000000402b5328').refresh(json)
         // terminar isso aqui   // Account.update(auth.id, {
            //     newAuth
            // })
        }
        await this.Launch({
            authenticator: this.convert(auth),
            timeout: 10000,
            path: settings.path,
            version: version,
            detached: false,
            downloadFileMultiple: 100,
            loader: {
                path: "./loaders",
                type: type,
                build: "latest",
                enable: !(type == 'vanilla')
            },

            verify: false,
            ignored: ['loader', 'options.txt'],
            java: {
                type: "jdk",
            },
            screen: {
                width: settings.width,
                height: settings.height,
            },

            memory: {
                min: `${settings.min}M`,
                max: `${settings.max}M`
            },
            url: null,
            JVM_ARGS: [],
            GAME_ARGS: [],
            mcp: undefined
        })
    }

    convert(account_connect: any) {
        return {
            access_token: account_connect.access_token,
            client_token: account_connect.client_token,
            uuid: account_connect.uuid,
            name: account_connect.name,
            user_properties: JSON.parse(account_connect.user_properties),
            meta: JSON.parse(account_connect.meta)
        }
    }

}

export {
    Launcher
}