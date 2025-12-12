import { ConfigPage as Config } from "../interfaces/launcher.js"

abstract class PageBase {
    pageName: string
    accsHeadsByName: Map<string, string>;
    abstract init(): void

    constructor(config: Config) {
        this.pageName = config.pageName
        this.accsHeadsByName = new Map<string, string>();
        this.initNotification()
    }

    initNotification() {
        const close_not_1 = document.getElementById('close-not') as HTMLButtonElement
        const close_not_2 = document.getElementById('close-not-2') as HTMLButtonElement
        const not = document.getElementById('not') as HTMLDivElement

        close_not_1.addEventListener('click', () => {
            not.classList.add('hidden')
            not.classList.remove('flex')
        })
        close_not_2.addEventListener('click', () => {
            not.classList.add('hidden')
            not.classList.remove('flex')
        })
    }

    notification(message: string) {
        const not = document.getElementById('not') as HTMLDivElement
        not.classList.add('flex')
        not.classList.remove('hidden')

        const value = document.getElementById('not-value') as HTMLDivElement
        value.innerHTML = message
    }
}

export {
    PageBase
} 