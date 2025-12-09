"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
require("dotenv/config");
const adapter_better_sqlite3_1 = require("@prisma/adapter-better-sqlite3");
const client_1 = require("../../generated/prisma/client");
const appdata_path_1 = __importDefault(require("appdata-path"));
const node_path_1 = require("node:path");
const connectionString = `file:${(0, node_path_1.join)((0, appdata_path_1.default)('brlauncher'), "dev.db")}`;
const adapter = new adapter_better_sqlite3_1.PrismaBetterSqlite3({ url: connectionString });
const prisma = new client_1.PrismaClient({ adapter });
exports.prisma = prisma;
