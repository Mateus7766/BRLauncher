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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoUpdater = void 0;
const node_fs_1 = require("node:fs");
const semver_1 = __importDefault(require("semver"));
const events_1 = __importDefault(require("events"));
const decompress_1 = __importDefault(require("decompress"));
const node_child_process_1 = require("node:child_process");
const path_1 = __importDefault(require("path"));
class AutoUpdater extends events_1.default {
    constructor() {
        super();
        console.log("[CLIENT SIDE] O AUTOUPDATER FOI INICIALIZADO");
        this.checkForUpdates();
    }
    checkForUpdates() {
        const version = JSON.parse((0, node_fs_1.readFileSync)(path_1.default.join(__dirname, "..", "..", "..", "package.json"), "utf-8")).version;
        console.log(version);
        fetch("https://raw.githubusercontent.com/VOTRON157/BRLauncher/main/package.json", {
            headers: {
                'Cache-Control': 'no-cache', // Instrui o servidor a não usar o cache
                'Pragma': 'no-cache', // Outra instrução para não usar o cache (para compatibilidade com navegadores mais antigos)    
                'Expires': '0',
            },
            cache: 'no-cache'
        })
            .then((res) => res.json())
            .then((json) => __awaiter(this, void 0, void 0, function* () {
            console.log(json);
            if (semver_1.default.lt(version, json.version))
                this.emit("update-found");
            else
                this.emit("update-notavaliable");
        }));
    }
    downloadNewVersion() {
        return __awaiter(this, void 0, void 0, function* () {
            this.emit("downloading-zip");
            const newVersion = "https://github.com/VOTRON157/BRLauncher/archive/refs/heads/main.zip";
            const data = yield fetch(newVersion, {
                headers: {
                    'Cache-Control': 'no-cache', // Instrui o servidor a não usar o cache
                    'Pragma': 'no-cache', // Outra instrução para não usar o cache (para compatibilidade com navegadores mais antigos)    
                    'Expires': '0',
                },
                cache: 'no-cache'
            });
            const buffer = Buffer.from(yield (yield data.blob()).arrayBuffer());
            (0, node_child_process_1.exec)(`mkdir "${path_1.default.join(__dirname, '..', '..', '..', 'updater')}"`, (error, stdout, stderr) => {
                if (error)
                    this.emit("error", error);
                if (stderr)
                    this.emit("error", stderr);
                this.emit("unpacking");
                const writeStream = (0, node_fs_1.createWriteStream)(path_1.default.join(__dirname, '..', '..', '..', 'updater', 'brlauncher.zip'));
                writeStream.write(buffer);
                writeStream.end();
                writeStream.on("finish", () => {
                    (0, decompress_1.default)(path_1.default.join(__dirname, '..', '..', '..', 'updater', 'brlauncher.zip'), path_1.default.join(__dirname, '..', '..', '..', 'updater', 'brlauncher')) // 💀
                        .then(() => {
                        this.emit("copy");
                        const updaterPath = path_1.default.join(__dirname, '..', '..', '..', 'updater', 'brlauncher', 'BRLauncher-main', '*');
                        const root = path_1.default.join(__dirname, '..', '..', '..');
                        (0, node_child_process_1.exec)(`xcopy "${updaterPath}" "${root}" /E /I /H /Y`, (error, stdout, stderr) => {
                            if (error)
                                this.emit("error", error);
                            if (stderr)
                                this.emit("error", stderr);
                            (0, node_child_process_1.exec)(`rd /s /q "${path_1.default.join(__dirname, '..', '..', '..', 'updater')}"`, (error, stdout, stderr) => {
                                if (error)
                                    this.emit("error", error);
                                if (stderr)
                                    this.emit("error", stderr);
                                this.emit("finished");
                            });
                        });
                    });
                });
            });
        });
    }
}
exports.AutoUpdater = AutoUpdater;
// sim eu fiz isso kkkk, eu não achei nenhum pacote que funcionase 
