"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomePage = void 0;
const launcher_js_1 = require("./launcher.js");
const autoupdater_js_1 = require("./autoupdater.js");
const electron_1 = require("electron");
const base_js_1 = require("../base.js");
class HomePage extends base_js_1.PageBase {
    constructor() {
        super({
            pageName: 'home'
        });
        console.log("[CLIENT SIDE] A HOME FOI CARREGADA");
        // this.getInstalledVersions()
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.manageDropdown();
            this.initUpdater();
            const play = document.getElementById('play');
            play.addEventListener('click', () => {
                this.startLauncher();
                play.innerHTML = '<span class="material-icons">play_disabled</span> Instalando...';
                play.disabled = true;
            });
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
    getNeoForgeVersions() {
        return __awaiter(this, void 0, void 0, function* () {
            const tempArray = [];
            let neoforge = (yield (yield fetch("https://maven.neoforged.net/api/maven/versions/releases/net/neoforged/neoforge")).json()).versions.map(version => {
                version = version.split(".").slice(0, 2).join(".");
                if (!tempArray.includes(version))
                    tempArray.push(version);
            });
            tempArray.shift();
            console.log(tempArray);
            return tempArray;
        });
    }
    getQuiltVersions() {
        return __awaiter(this, void 0, void 0, function* () {
            let quilt = (yield (yield fetch("https://meta.quiltmc.org/v3/versions")).json()).game.filter(v => v.stable).map(v => v.version);
            return quilt;
        });
    }
    getFabricVersions() {
        return __awaiter(this, void 0, void 0, function* () {
            let fabric = (yield (yield fetch("https://meta.fabricmc.net/v2/versions/game")).json()).filter(v => v.stable).map(v => v.version);
            return fabric;
        });
    }
    getVanillaVersions() {
        return __awaiter(this, void 0, void 0, function* () {
            let vanilla = (yield (yield fetch("https://piston-meta.mojang.com/mc/game/version_manifest_v2.json")).json()).versions.filter(v => v.type === "release").map(v => v.id);
            return vanilla;
        });
    }
    getForgeVersions() {
        return __awaiter(this, void 0, void 0, function* () {
            let forge = yield (yield fetch("https://files.minecraftforge.net/net/minecraftforge/forge/maven-metadata.json")).json();
            return forge;
            // https://files.minecraftforge.net/net/minecraftforge/forge/maven-metadata.json
        });
    }
    returnOptionElement(type, version) {
        const div = document.createElement('div');
        div.classList.add('flex', 'items-center', 'gap-x-3', 'p-2', 'cursor-pointer', 'border-l-0', 'hover:border-l-4', 'border-blue-500', 'duration-150');
        div.innerHTML = `<img src="../core/imgs/${type}.png" width="30">${type} ${version}`;
        div.addEventListener('click', () => this.setDropdownItem(div.innerHTML.split('>')[1]));
        return div;
    }
    setDropdownItem(item) {
        const fake = document.getElementById('fake-select');
        fake.innerHTML = `<img src="../core/imgs/${item.split(' ')[0]}.png" width="30">${item}`;
        const input = document.getElementById('version');
        input.value = item;
    }
    manageDropdown() {
        return __awaiter(this, void 0, void 0, function* () {
            const vanilla = yield this.getVanillaVersions();
            const fabric = yield this.getFabricVersions();
            const forge = yield this.getForgeVersions();
            const quilt = yield this.getQuiltVersions();
            const neoforge = yield this.getNeoForgeVersions();
            const options = document.getElementById('options');
            for (let version of vanilla) {
                const forgeDiv = this.returnOptionElement('forge', version);
                const fabricDiv = this.returnOptionElement('fabric', version);
                const vanillaDiv = this.returnOptionElement('vanilla', version);
                const quiltDiv = this.returnOptionElement('quilt', version);
                const neoforgeDiv = this.returnOptionElement('neoforge', version);
                options.appendChild(vanillaDiv);
                if (fabric.includes(version)) {
                    options.appendChild(fabricDiv);
                }
                if (Object.keys(forge).includes(version)) {
                    options.appendChild(forgeDiv);
                }
                if (quilt.includes(version)) {
                    options.appendChild(quiltDiv);
                }
                if (neoforge.includes(version.split(".").slice(1, 3).join("."))) {
                    options.appendChild(neoforgeDiv);
                }
            }
        });
    }
    startLauncher() {
        const [type, version] = document.getElementById('version').value.split(' ');
        const launcher = new launcher_js_1.Launcher();
        launcher.init(version, type);
        const barra = document.getElementById('barra');
        barra.style.padding = "0.25rem";
        launcher.on("progress", (progress, size, element) => {
            const porcentagem = Math.round((progress / size) * 100);
            barra.innerHTML = `Baixando ${element} | ${porcentagem}% | ${(progress / 1024).toFixed(2)}/${(size / 1024).toFixed(2)} MB`;
            barra.style.width = `${porcentagem}%`;
        });
        launcher.on("check", (progress, size, element) => {
            const porcentagem = Math.round((progress / size) * 100);
            barra.innerHTML = `Checando ${element} | ${porcentagem}% | ${(progress / 1024).toFixed(2)}/${(size / 1024).toFixed(2)} MB`;
            barra.style.width = `${porcentagem}%`;
        });
        launcher.on("error", (err) => {
            barra.innerHTML = `<span class="text-red-700">${JSON.stringify(err)}</span>`;
            barra.style.width = `100%`;
        });
        launcher.on('data', (data) => {
            barra.innerHTML = '<span class="text-lime-700">Iniciando JVM e o Minecraft</span>';
            barra.style.width = '100%';
            if (data.includes("Launching")) {
                barra.innerHTML = '<span class="text-lime-700">Jogo rodando...</span>';
                electron_1.ipcRenderer.invoke("playing", `${type} ${version}`);
            }
        });
        launcher.on('close', (code) => {
            barra.style.width = '0%';
            barra.style.padding = "0px";
            const play = document.getElementById('play');
            play.disabled = false;
            play.innerHTML = '<span class="material-icons">play_circle</span> Instalar e Jogar';
            electron_1.ipcRenderer.invoke("stopPlaying");
        });
    }
    initUpdater() {
        const autoUpdater = new autoupdater_js_1.AutoUpdater();
        const updater = document.getElementById("updater");
        const no_button = document.getElementById("nupdate");
        const no_button_x = document.getElementById("close-updater");
        const yes_button = document.getElementById("yupdate");
        autoUpdater.on("update-found", () => {
            updater.classList.add('flex');
            updater.classList.remove('hidden');
            console.log('Update encontrado');
        });
        autoUpdater.on("update-notavaliable", () => console.log('O launcher já está atualizado.'));
        no_button.addEventListener("click", (event) => {
            updater.classList.add('hidden');
            updater.classList.remove('flex');
        });
        no_button_x.addEventListener("click", (event) => {
            updater.classList.add('hidden');
            updater.classList.remove('flex');
        });
        yes_button.addEventListener("click", (event) => {
            yes_button.setAttribute('disabled', 'true');
            updater.classList.add('hidden');
            updater.classList.remove('flex');
            autoUpdater.downloadNewVersion();
            autoUpdater.on("finished", () => {
                this.notification("O BRLauncher foi atualizado para a versão mais recente. Reabra o launcher para ver as novidades.");
            });
            autoUpdater.on('error', (error) => {
                console.log(error);
            });
        });
    }
}
exports.HomePage = HomePage;
