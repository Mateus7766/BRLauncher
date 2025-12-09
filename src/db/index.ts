import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../../generated/prisma/client";
import getAppDataPath from "appdata-path"
import { join } from "node:path";


const connectionString = `file:${join(getAppDataPath('brlauncher'), "dev.db")}`

const adapter = new PrismaBetterSqlite3({ url: connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma };      