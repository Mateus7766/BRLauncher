import { ipcRenderer } from "electron"

export const Account = {
  update: (id: number, data: any) =>
   ipcRenderer.invoke("account:update", { id, data }),

  create: (data: any) =>
   ipcRenderer.invoke("account:create", data),

  delete: (id: number) =>
   ipcRenderer.invoke("account:delete", id),

  getById: (id: number) =>
   ipcRenderer.invoke("account:getById", id),

  getAtual: () =>
   ipcRenderer.invoke("account:getAtual"),

  accounts: () =>
   ipcRenderer.invoke("account:accounts")
}

export default Account