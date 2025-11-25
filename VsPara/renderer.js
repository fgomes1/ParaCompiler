let codeEditor, consoleOutput, btnCompile, btnOpenFolder, btnNewFile, btnSave;
let fileList, currentFileSpan, autoSaveIndicator;
let currentFolder = null;
let currentFile = null;
let autoSaveTimeout = null;

document.addEventListener('DOMContentLoaded', () => {
    codeEditor = document.getElementById('codeEditor');
    consoleOutput = document.getElementById('consoleOutput');
    btnCompile = document.getElementById('btnCompile');
    btnOpenFolder = document.getElementById('btnOpenFolder');
    btnNewFile = document.getElementById('btnNewFile');
    btnSave = document.getElementById('btnSave');
    fileList = document.getElementById('fileList');
    currentFileSpan = document.getElementById('currentFile');
    autoSaveIndicator = document.getElementById('autoSaveIndicator');

    btnCompile.addEventListener('click', compile);
    btnOpenFolder.addEventListener('click', openFolder);
    btnNewFile.addEventListener('click', createNewFile);
    btnSave.addEventListener('click', saveFile);

    codeEditor.addEventListener('input', () => {
        if (currentFolder && currentFile) {
            clearTimeout(autoSaveTimeout);
            autoSaveIndicator.textContent = 'Salvando...';
            autoSaveIndicator.className = 'auto-save-indicator saving';

            autoSaveTimeout = setTimeout(async () => {
                await autoSave();
            }, 1000);
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            saveFile();
        }
    });
});

async function openFolder() {
    try {
        const result = await window.electronAPI.openFolder();

        if (result.success) {
            currentFolder = result.folderPath;
            updateConsole('✅ Pasta aberta: ' + result.folderPath);
            loadFileList(result.files);
        }
    } catch (err) {
        updateConsole('❌ Erro ao abrir pasta: ' + err.message);
    }
}

async function createNewFile() {
    if (!currentFolder) {
        updateConsole('❌ Abra uma pasta primeiro!');
        return;
    }

    // Mostrar dialog
    const fileDialog = document.getElementById('fileDialog');
    const fileNameInput = document.getElementById('fileNameInput');
    fileDialog.style.display = 'flex';
    fileNameInput.value = 'novo_arquivo';
    fileNameInput.select();
    fileNameInput.focus();

    // Handler para criar
    const createFile = async () => {
        const fileName = fileNameInput.value.trim();
        if (!fileName) {
            fileDialog.style.display = 'none';
            return;
        }

        const fullFileName = fileName.endsWith('.para') ? fileName : fileName + '.para';

        try {
            const result = await window.electronAPI.createNewFile(currentFolder, fullFileName);

            if (result.success) {
                currentFile = fullFileName;
                codeEditor.value = '';
                currentFileSpan.textContent = fullFileName;
                updateConsole('✅ Arquivo criado: ' + fullFileName);

                const folderResult = await window.electronAPI.openFolder();
                if (folderResult.success) {
                    loadFileList(folderResult.files);
                }
            }
        } catch (err) {
            updateConsole('❌ Erro ao criar arquivo: ' + err.message);
        }

        fileDialog.style.display = 'none';
    };

    // Botão OK
    const btnOk = document.getElementById('btnDialogOk');
    const btnCancel = document.getElementById('btnDialogCancel');

    const okHandler = () => {
        createFile();
        btnOk.removeEventListener('click', okHandler);
        btnCancel.removeEventListener('click', cancelHandler);
        fileNameInput.removeEventListener('keypress', keypressHandler);
    };

    const cancelHandler = () => {
        fileDialog.style.display = 'none';
        btnOk.removeEventListener('click', okHandler);
        btnCancel.removeEventListener('click', cancelHandler);
        fileNameInput.removeEventListener('keypress', keypressHandler);
    };

    const keypressHandler = (e) => {
        if (e.key === 'Enter') {
            createFile();
            btnOk.removeEventListener('click', okHandler);
            btnCancel.removeEventListener('click', cancelHandler);
            fileNameInput.removeEventListener('keypress', keypressHandler);
        } else if (e.key === 'Escape') {
            fileDialog.style.display = 'none';
            btnOk.removeEventListener('click', okHandler);
            btnCancel.removeEventListener('click', cancelHandler);
            fileNameInput.removeEventListener('keypress', keypressHandler);
        }
    };

    btnOk.addEventListener('click', okHandler);
    btnCancel.addEventListener('click', cancelHandler);
    fileNameInput.addEventListener('keypress', keypressHandler);
}

function loadFileList(files) {
    fileList.innerHTML = '';

    if (files.length === 0) {
        fileList.innerHTML = '<div class="no-folder">Nenhum arquivo .para encontrado</div>';
        return;
    }

    files.forEach(file => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = '<span class="file-icon">📄</span>' + file;
        fileItem.onclick = () => openFileFromList(file);
        fileList.appendChild(fileItem);
    });
}

async function openFileFromList(fileName) {
    if (!currentFolder) return;

    try {
        const result = await window.electronAPI.openFileFromPath(currentFolder, fileName);

        if (result.success) {
            currentFile = fileName;
            codeEditor.value = result.content;
            currentFileSpan.textContent = fileName;
            updateConsole('✅ Arquivo aberto: ' + fileName);

            document.querySelectorAll('.file-item').forEach(item => {
                item.classList.remove('active');
                if (item.textContent.includes(fileName)) {
                    item.classList.add('active');
                }
            });
        }
    } catch (err) {
        updateConsole('❌ Erro ao abrir arquivo: ' + err.message);
    }
}

async function compile() {
    const code = codeEditor.value;

    if (!code.trim()) {
        updateConsole('❌ Erro: Digite algum código antes de compilar!');
        return;
    }

    updateConsole('🔄 Compilando...\n');

    try {
        const result = await window.electronAPI.compile(code);

        if (result.error) {
            updateConsole('❌ Erro:\n' + result.error);
        } else if (result.output) {
            updateConsole('✅ Saída:\n' + result.output);
        } else {
            updateConsole('⚠️ Nenhuma saída gerada.');
        }
    } catch (err) {
        updateConsole('❌ Erro ao executar compilador:\n' + err.message + '\n\nVerifique se o Java está instalado e o código foi compilado.');
    }
}

function updateConsole(message) {
    consoleOutput.textContent = message;
}

async function autoSave() {
    if (!currentFolder || !currentFile) return;

    try {
        const content = codeEditor.value;
        await window.electronAPI.saveFileInFolder(currentFolder, currentFile, content);
        autoSaveIndicator.textContent = 'Salvo ✓';
        autoSaveIndicator.className = 'auto-save-indicator saved';

        setTimeout(() => {
            autoSaveIndicator.textContent = '';
        }, 2000);
    } catch (err) {
        autoSaveIndicator.textContent = 'Erro ao salvar';
        autoSaveIndicator.className = 'auto-save-indicator';
    }
}

async function saveFile() {
    try {
        const content = codeEditor.value;

        if (currentFolder && currentFile) {
            const result = await window.electronAPI.saveFileInFolder(currentFolder, currentFile, content);
            if (result.success) {
                updateConsole('✅ Arquivo salvo: ' + currentFile);
                autoSaveIndicator.textContent = 'Salvo ✓';
                autoSaveIndicator.className = 'auto-save-indicator saved';
            }
        } else {
            const result = await window.electronAPI.saveFile(content);
            if (result.success) {
                updateConsole('✅ Arquivo salvo: ' + result.filePath);

                if (currentFolder) {
                    const folderResult = await window.electronAPI.openFolder();
                    if (folderResult.success) {
                        loadFileList(folderResult.files);
                    }
                }
            }
        }
    } catch (err) {
        updateConsole('❌ Erro ao salvar arquivo: ' + err.message);
    }
}
