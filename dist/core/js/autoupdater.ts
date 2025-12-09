import { createWriteStream, readFileSync } from "node:fs";
import { Events } from "../../interfaces/launcher";
import semver from "semver"
import EventEmitter from "events"
import TypedEmitter from "typed-emitter";
import decompress from "decompress";
import { exec } from "node:child_process";
import path from "path"

class AutoUpdater extends (EventEmitter as new () => TypedEmitter<Events>) {
  constructor() {
    super()
    console.log("[CLIENT SIDE] O AUTOUPDATER FOI INICIALIZADO")
    this.checkForUpdates()
  }

  checkForUpdates() {
    const version = JSON.parse(readFileSync(path.join(__dirname, "..", "..", "..", "package.json"), "utf-8")).version
    fetch("https://raw.githubusercontent.com/Mateus7766/BRLauncher/main/package.json", {
      headers: {
        'Cache-Control': 'no-cache', 
        'Pragma': 'no-cache',        
      },
      cache: 'no-cache'
    })
      .then((res) => res.json())
      .then(async (json) => {
        if (semver.lt(version, json.version)) this.emit("update-found")
        else this.emit("update-notavaliable")
      });
  }

  async downloadNewVersion() {

    this.emit("downloading-zip")
    const newVersion = "https://github.com/Mateus7766/BRLauncher/archive/refs/heads/main.zip";
    const data = await fetch(newVersion, {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
      cache: 'no-cache'
    });
    const buffer = Buffer.from(await (await data.blob()).arrayBuffer());

    exec(`mkdir "${path.join(__dirname, '..', '..', '..', 'updater')}"`, (error, stdout, stderr) => {
      if (error) this.emit("error", error)
      if (stderr) this.emit("error", stderr as any)

      this.emit("unpacking")

      const writeStream = createWriteStream(path.join(__dirname, '..', '..', '..', 'updater', 'brlauncher.zip'))
      writeStream.write(buffer)
      writeStream.end()
      writeStream.on("finish", () => {
        decompress(path.join(__dirname, '..', '..', '..', 'updater', 'brlauncher.zip'), path.join(__dirname, '..', '..', '..', 'updater', 'brlauncher')) // 💀
          .then(() => {
            this.emit("copy")
            const updaterPath = path.join(__dirname, '..', '..', '..', 'updater', 'brlauncher', 'BRLauncher-main', '*')
            const root = path.join(__dirname, '..', '..', '..')

            exec(`xcopy "${updaterPath}" "${root}" /E /I /H /Y`, (error, stdout, stderr) => {
              if (error) this.emit("error", error)
              if (stderr) this.emit("error", stderr as any)
              exec(`rd /s /q "${path.join(__dirname, '..', '..', '..', 'updater')}"`,
                (error, stdout, stderr) => {
                  if (error) this.emit("error", error)
                  if (stderr) this.emit("error", stderr as any)
                  this.emit("finished")
                })
            })
          })
      })
    })
  }
}


/* const testefoda = new AutoUpdater()

 testefoda.on("update-notavaliable", () => {
  console.log("Não tem nada pra baixar :(")
})

testefoda.on("update-found", async () => {
  console.log("Update encontrado deseja atualizar?")
  await testefoda.downloadNewVersion()
})

testefoda.on("downloading-zip", () => {
  console.log("Baixando .zip da atualização")
})

testefoda.on("unpacking", () => {
  console.log("Descompactando recursos")
})

testefoda.on("copy", () => {
  console.log("copiando recursos")
})

testefoda.on("finished", () => {
  console.log("Atualização concluida! reiniciando o launcher")
}) */

export {
  AutoUpdater
}

// sim eu fiz isso kkkk, eu não achei nenhum pacote que funcionase 