import client from "discord-rich-presence";
import { EasyPresence as Presence } from "easy-presence";
import config from "../../config.js";

const presence = new Presence(config.discord_app_id);
// const discord_client = client(config.discord_app_id);

export class DiscordStatusManager {
    initDate: Date
    constructor() {
        presence.on('conneting', () => console.log('Conectando-se ao Discord.'))
        presence.on('disconnected', () => console.log('Desconectado do Discord.'))
        presence.on('activityUpdate', () => console.log('Status do Discord atualizado.'))
        presence.on('connected', () => console.log('Conectado ao Discord.'))

        console.log("[SERVER SIDE] STATUS DO DISCORD CARREGADO")
        this.initDate = new Date();
    }
    setStatusPage(page: string) {
        presence.setActivity({
            details: 'Ainda não iniciou o Minecraft',
            instance: false,
            state: page,
            assets: {
                large_image: 'minelogo',
                large_text: 'BRLauncher'
            },
            timestamps: {
                start: this.initDate,
            },
            buttons: [
                {
                    label: 'Download Launcher',
                    url: 'https://github.com/VOTRON157/BRLauncher'
                }
            ]
        })
    }
    setPlaying(version: string) {
        presence.setActivity({
            details: `Minecraft ${version.split(" ")[1]}`,
            instance: false,
            state: `Jogando Minecraft ${version.split(" ")[0].replace('fabric', 'Fabric (Modded)').replace('forge', 'Forge (Modded)').replace('vanilla', "Vanilla")}`,
            assets: {
                small_image: version.split(" ")[0],
                small_text: version.split(" ")[1],
                large_image: 'minelogo',
                large_text: 'BRLauncher'
            },
            timestamps: {
                start: this.initDate,
            },
            buttons: [
                {
                    label: 'Download Launcher',
                    url: 'https://github.com/Mateus7766/BRLauncher'
                }
            ]
        })
    }
}