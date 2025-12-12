"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageBase = void 0;
class PageBase {
    constructor(config) {
        this.pageName = config.pageName;
        this.accsHeadsByName = new Map();
        this.initNotification();
    }
    initNotification() {
        const close_not_1 = document.getElementById('close-not');
        const close_not_2 = document.getElementById('close-not-2');
        const not = document.getElementById('not');
        close_not_1.addEventListener('click', () => {
            not.classList.add('hidden');
            not.classList.remove('flex');
        });
        close_not_2.addEventListener('click', () => {
            not.classList.add('hidden');
            not.classList.remove('flex');
        });
    }
    notification(message) {
        const not = document.getElementById('not');
        not.classList.add('flex');
        not.classList.remove('hidden');
        const value = document.getElementById('not-value');
        value.innerHTML = message;
    }
}
exports.PageBase = PageBase;
