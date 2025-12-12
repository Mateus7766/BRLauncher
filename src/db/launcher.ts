import { ipcRenderer } from "electron"


export const Launcher = {
  update: (path: string, min: number, max: number, width: number, height: number, elyBy: boolean, lastUsed?: string) =>
   ipcRenderer.invoke("launcher:update", { path, min, max, width, height, elyBy, lastUsed }),

  resetConfig: () =>
   ipcRenderer.invoke("launcher:resetConfig"),

  config: () =>
   ipcRenderer.invoke("launcher:config")
}


export default Launcher