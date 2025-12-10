import * as shell from "shelljs";
import { existsSync } from "fs"

;(async () => {
    if (!existsSync("./dist/pages")) shell.mkdir("dist/pages")
    if (!existsSync("./dist/core/imgs")) shell.mkdir("dist/core/imgs")
    if (!existsSync("./dist/core/css")) shell.mkdir("dist/core/css")
    shell.cp("-R", ["src/core/imgs/*"], "dist/core/imgs/")
    shell.cp("-R", ["src/pages/*"], "dist/pages/")
    shell.cp("-R", ["src/core/css/*.css"], "dist/core/css")
})()

