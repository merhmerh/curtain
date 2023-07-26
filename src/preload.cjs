const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ipc', {
    send: (channel, data) => {
        ipcRenderer.send(channel, data);
    },
    sendSync: (channel, data) => {
        ipcRenderer.sendSync(channel, data);
    },
    receive: (channel, func) => {
        ipcRenderer.on(channel, (event, ...args) => func(...args));
    },
    promise: async (eventName, data) => {
        return await ipcRenderer.invoke(eventName, data)
    },
    handle: (channel, callable, event, data) =>
        ipcRenderer.on(channel, callable(event, data)),
});
