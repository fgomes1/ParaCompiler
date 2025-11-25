const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        backgroundColor: '#1e1e1e',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    mainWindow.loadFile('index.html');

    // Abrir DevTools para debug
    mainWindow.webContents.openDevTools();
}

// IPC Handlers
ipcMain.handle('dialog:openFile', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
        filters: [
            { name: 'ParaCompiler Files', extensions: ['para', 'txt'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    });

    if (!result.canceled && result.filePaths.length > 0) {
        const filePath = result.filePaths[0];
        const content = fs.readFileSync(filePath, 'utf8');
        return { success: true, filePath, content };
    }
    return { success: false };
});

ipcMain.handle('dialog:saveFile', async (event, content) => {
    const result = await dialog.showSaveDialog(mainWindow, {
        filters: [
            { name: 'ParaCompiler Files', extensions: ['para'] },
            { name: 'Text Files', extensions: ['txt'] }
        ]
    });

    if (!result.canceled && result.filePath) {
        fs.writeFileSync(result.filePath, content, 'utf8');
        return { success: true, filePath: result.filePath };
    }
    return { success: false };
});

ipcMain.handle('compile:code', async (event, code) => {
    return new Promise((resolve, reject) => {
        const javaPath = 'java';
        const classPath = path.join(__dirname, '..', 'bin');

        const compiler = spawn(javaPath, ['-cp', classPath, 'compiler.ParaCompiler'], {
            cwd: path.join(__dirname, '..')
        });

        console.log('--- COMPILING CODE ---');
        console.log(code);
        console.log('----------------------');
        compiler.stdin.write(code + '\n\n');
        compiler.stdin.end();

        let output = '';
        let error = '';

        compiler.stdout.on('data', (data) => {
            output += data.toString();
        });

        compiler.stderr.on('data', (data) => {
            error += data.toString();
        });

        compiler.on('close', (exitCode) => {
            resolve({ output, error, exitCode });
        });

        compiler.on('error', (err) => {
            reject({ error: err.message });
        });
    });
});

ipcMain.handle('dialog:openFolder', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory']
    });

    if (!result.canceled && result.filePaths.length > 0) {
        const folderPath = result.filePaths[0];
        const files = fs.readdirSync(folderPath)
            .filter(file => file.endsWith('.para'))
            .sort();

        return { success: true, folderPath, files };
    }
    return { success: false };
});

ipcMain.handle('dialog:openFileFromPath', async (event, folderPath, fileName) => {
    const filePath = path.join(folderPath, fileName);
    const content = fs.readFileSync(filePath, 'utf8');
    return { success: true, content };
});

ipcMain.handle('dialog:saveFileInFolder', async (event, folderPath, fileName, content) => {
    const filePath = path.join(folderPath, fileName);
    fs.writeFileSync(filePath, content, 'utf8');
    return { success: true, filePath };
});

ipcMain.handle('file:create', async (event, folderPath, fileName) => {
    const filePath = path.join(folderPath, fileName);

    if (fs.existsSync(filePath)) {
        return { success: false, error: 'Arquivo já existe' };
    }

    fs.writeFileSync(filePath, '', 'utf8');
    return { success: true, filePath };
});

ipcMain.handle('file:rename', async (event, oldPath, newPath) => {
    if (fs.existsSync(newPath)) {
        return { success: false, error: 'Um arquivo com este nome já existe.' };
    }
    try {
        fs.renameSync(oldPath, newPath);
        return { success: true };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

ipcMain.handle('file:delete', async (event, filePath) => {
    try {
        fs.unlinkSync(filePath);
        return { success: true };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

ipcMain.handle('file:readFolder', async (event, folderPath) => {
    try {
        const files = fs.readdirSync(folderPath)
            .filter(file => file.endsWith('.para'))
            .sort();
        return { success: true, files };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
