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
exports.Launcher = void 0;
const minecraft_java_core_1 = require("minecraft-java-core");
const launcher_js_1 = __importDefault(require("../../db/launcher.js"));
const account_js_1 = __importDefault(require("../../db/account.js"));
const path_1 = __importDefault(require("path"));
class Launcher extends minecraft_java_core_1.Launch {
    constructor() {
        super();
        console.log("[CLIENT SIDE] CLASSE LAUNCHER CARREGADA");
    }
    init(version, type) {
        return __awaiter(this, void 0, void 0, function* () {
            const accounts = yield account_js_1.default.accounts();
            if (!accounts.length) {
                alert("Você não pode jogar sem criar uma conta, vá para o menu 'Contas' para criar uma.");
                this.emit('close');
                return;
            }
            const settings = yield launcher_js_1.default.config();
            if (!settings)
                return;
            let auth = yield account_js_1.default.getAtual();
            if (auth.type == "Microsoft") {
                if (settings.elyBy) {
                    new window.Notification('BRLauncher', {
                        body: 'Você está usando uma conta Microsoft com o Ely.by skins ativado, sua skin da Microsoft não será exibida durante o jogo.'
                    });
                }
                const json = this.convert(auth);
                const newAuth = yield new minecraft_java_core_1.Microsoft('00000000402b5328').refresh(json);
                auth = yield account_js_1.default.update(auth.id, {
                    access_token: newAuth.access_token,
                    client_token: newAuth.client_token,
                    uuid: newAuth.uuid,
                    user_properties: JSON.stringify(newAuth.user_properties),
                    meta: JSON.stringify(newAuth.meta),
                    name: newAuth.name
                })
                    .catch(e => {
                    console.log("Erro ao atualizar token Microsoft: " + e);
                });
                console.log("[ Microsoft ] Token Microsoft atualizado");
            }
            else if (auth.type == "Ely.by" && !settings.elyBy) {
                new window.Notification('BRLauncher', {
                    body: 'Você está usando uma conta Ely.by com o Ely.by skins desativado, sua skin NÃO será exibida durante o jogo, e nem a de outros jogadores, mas você ainda pode jogar normalmente.'
                });
                // alert("O launcher verificou que o Ely.by skins está desativado nas configurações, sendo que você está usando uma conta Ely.by para jogar, note que você não poderá ver sua skin durante o jogo nem a de outros jogadores, mas você ainda pode jogar normalmente.")
            }
            const jvmArgs = [];
            const authLibPath = path_1.default.join(__dirname, "..", "..", "..", "authlib-injector-1.2.6.jar");
            if (settings.elyBy)
                jvmArgs.push(`-javaagent:${authLibPath}=ely.by`, '-Dauthlibinjector.side=client');
            yield this.Launch({
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
            });
        });
    }
    convert(account_connect) {
        return {
            access_token: account_connect.access_token,
            client_token: account_connect.client_token,
            uuid: account_connect.uuid,
            name: account_connect.name,
            user_properties: JSON.parse(account_connect.user_properties),
            meta: JSON.parse(account_connect.meta)
        };
    }
}
exports.Launcher = Launcher;
