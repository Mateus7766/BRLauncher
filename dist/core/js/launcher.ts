import { Launch, Microsoft } from "minecraft-java-core"
import LauncherSettings from "../../db/launcher.js"
import Account from "../../db/account.js"
import path from "path"
import { title } from "process"

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

        let auth = await Account.getAtual()
        if (auth.type == "Microsoft") {
            if (settings.elyBy) {
                new window.Notification('BRLauncher', {
                    body: 'Você está usando uma conta Microsoft com o Ely.by skins ativado, sua skin será exibida durante o jogo, mas você pode ter problemas de autenticação caso a Microsoft mude algo no sistema de login.'
                });
            }
            const json = this.convert(auth)
            const newAuth = await new Microsoft('00000000402b5328').refresh(json)
            auth = await Account.update(auth.id, {
                access_token: newAuth.access_token,
                client_token: newAuth.client_token,
                uuid: newAuth.uuid,
                user_properties: JSON.stringify(newAuth.user_properties),
                meta: JSON.stringify(newAuth.meta),
                name: newAuth.name
            })
                .catch(e => {
                    console.log("Erro ao atualizar token Microsoft: " + e)
                });
            console.log("[ Microsoft ] Token Microsoft atualizado")
        } else if (auth.type == "Ely.by" && !settings.elyBy) {
            new window.Notification('BRLauncher', {
                body: 'Você está usando uma conta Ely.by com o Ely.by skins desativado, sua skin NÃO será exibida durante o jogo, e nem a de outros jogadores, mas você ainda pode jogar normalmente.'
            });
            // alert("O launcher verificou que o Ely.by skins está desativado nas configurações, sendo que você está usando uma conta Ely.by para jogar, note que você não poderá ver sua skin durante o jogo nem a de outros jogadores, mas você ainda pode jogar normalmente.")
        }
        const jvmArgs = [];
        const authLibPath = path.join(__dirname, "..", "..", "..", "authlib-injector-1.2.6.jar")
        if (settings.elyBy)
            jvmArgs.push(`-javaagent:${authLibPath}=ely.by`, '-Dauthlibinjector.side=client')

        await this.Launch({
            authenticator: auth,
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
            JVM_ARGS: jvmArgs,
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