"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscordStatusManager = void 0;
const easy_presence_1 = require("easy-presence");
const config_js_1 = __importDefault(require("../../config.js"));
const presence = new easy_presence_1.EasyPresence(config_js_1.default.discord_app_id);
// const discord_client = client(config.discord_app_id);
class DiscordStatusManager {
    constructor() {
        presence.on('conneting', () => console.log('Conectando-se ao Discord.'));
        presence.on('disconnected', () => console.log('Desconectado do Discord.'));
        presence.on('activityUpdate', () => console.log('Status do Discord atualizado.'));
        presence.on('connected', () => console.log('Conectado ao Discord.'));
        console.log("[SERVER SIDE] STATUS DO DISCORD CARREGADO");
        this.initDate = new Date();
    }
    setStatusPage(page) {
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
                    label: 'Baixar Launcher',
                    url: 'https://github.com/Mateus7766/BRLauncher'
                }
            ]
        });
    }
    setPlaying(version) {
        // presence.setActivity({
        //     details: `Minecraft ${version.split(" ")[1]}`,
        //     instance: false,
        //     state: `Jogando Minecraft ${version.split(" ")[0].replace('fabric', 'Fabric (Modded)').replace('forge', 'Forge (Modded)').replace('vanilla', "Vanilla")}`,
        //     assets: {
        //         small_image: version.split(" ")[0],
        //         small_text: version.split(" ")[1],
        //         large_image: 'minelogo',
        //         large_text: 'BRLauncher'
        //     },
        //     timestamps: {
        //         start: this.initDate,
        //     },
        //     buttons: [
        //         {
        //             label: 'Download Launcher',
        //             url: 'https://github.com/Mateus7766/BRLauncher'
        //         }
        //     ]
        // })
    }
}
exports.DiscordStatusManager = DiscordStatusManager;
