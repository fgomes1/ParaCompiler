const { contextBridge, ipcRenderer } = require('electron');

// Expor APIs seguras para o renderer
contextBridge.exposeInMainWorld('electronAPI', {
    openFolder: () => ipcRenderer.invoke('dialog:openFolder'),
    createNewFile: (folderPath, fileName) => ipcRenderer.invoke('file:create', folderPath, fileName),
    openFile: () => ipcRenderer.invoke('dialog:openFile'),
    openFileFromPath: (folderPath, fileName) => ipcRenderer.invoke('dialog:openFileFromPath', folderPath, fileName),
    saveFile: (content) => ipcRenderer.invoke('dialog:saveFile', content),
    saveFileInFolder: (folderPath, fileName, content) => ipcRenderer.invoke('dialog:saveFileInFolder', folderPath, fileName, content),
    compile: (code) => ipcRenderer.invoke('compile:code', code),
    renameFile: (oldPath, newPath) => ipcRenderer.invoke('file:rename', oldPath, newPath),
    deleteFile: (filePath) => ipcRenderer.invoke('file:delete', filePath),
    readFolder: (folderPath) => ipcRenderer.invoke('file:readFolder', folderPath)
});
