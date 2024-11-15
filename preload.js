const { ipcRenderer } = require('electron');
window.ipcRenderer = ipcRenderer;
window.addEventListener('DOMContentLoaded', () => {
    if (window.nonceValue) {
        document.querySelectorAll('script[nonce], link[nonce]').forEach((element) => {
            element.setAttribute('nonce', window.nonceValue);
        });
    }
});
