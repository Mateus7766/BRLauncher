import { ipcMain } from "electron"
import { prisma } from "./index.js"
import os from "os"
import getAppDataPath from "appdata-path"
import shell from "shelljs"

const javaPath = shell.exec("where java")

ipcMain.handle("launcher:update", async (_, data) => {
  const { path, min, max, width, height, elyBy } = data

  const newData = await prisma.launcher.update({
    where: { id: 1 },
    data: { path, min, max, width, height, elyBy }
  })

  return newData
})

ipcMain.handle("launcher:resetConfig", async () => {
  const exists = await prisma.launcher.findUnique({
    where: { id: 1 }
  })

  if (exists) {
    return await prisma.launcher.update({
      where: { id: 1 },
      data: {
        path: getAppDataPath(".minecraft"),
        min: 1024,
        max: Math.round(os.totalmem() / (1024 ** 2) / 2),
        width: 1000,
        height: 600,
        javaPath,
        elyBy: true,
      }
    })
  }

  return await prisma.launcher.create({
    data: {
      path: getAppDataPath(".minecraft"),
      min: 1024,
      max: Math.round(os.totalmem() / (1024 ** 2) / 2),
      width: 1000,
      height: 600,
      javaPath,
      elyBy: true
    }
  })
})

ipcMain.handle("launcher:config", async () => {
  const data = await prisma.launcher.findUnique({
    where: { id: 1 }
  })

  return data
})

ipcMain.handle("account:update", async (_, { id, data }) => {
  const account = await prisma.account.update({
    where: { id },
    data
  })

  return account
})

ipcMain.handle("account:create", async (_, data) => {
  const createdAccount = await prisma.account.create({
    data: {
      access_token: data.access_token,
      client_token: data.client_token,
      uuid: data.uuid,
      user_properties: JSON.stringify(data.user_properties),
      meta: JSON.stringify(data.meta),
      name: data.name,
      selected: false,
      type: data.type
    }
  })

  return createdAccount
})

ipcMain.handle("account:delete", async (_, id) => {
  const deletedAccount = await prisma.account.delete({
    where: { id }
  })

  return deletedAccount
})

ipcMain.handle("account:getById", async (_, id) => {
  const account = await prisma.account.findUnique({
    where: { id }
  })

  return account
})

ipcMain.handle("account:getAtual", async () => {
  const account = await prisma.account.findFirst({
    where: { selected: true }
  })

  return account
})

ipcMain.handle("account:accounts", async () => {
  const accounts = await prisma.account.findMany({})
  return accounts
})
