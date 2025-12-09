import util from "util";
import { exec as _exec } from "node:child_process";

const exec = util.promisify(_exec);

async function bootstrap() {
  console.log("Rodando migrações do banco de dados...");

  await exec("npx prisma migrate dev --name init");
  console.log("Migrações aplicadas com sucesso!");

  await exec("npx prisma generate");
  console.log("Prisma Client gerado com sucesso!");

  console.log("Iniciando aplicação... ");

  await import("./index");
}

bootstrap().catch(err => {
  console.error("Erro ao iniciar aplicação:", err);
  process.exit(1);
});
