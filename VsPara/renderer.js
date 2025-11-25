let editor;
let consoleOutput, btnCompile, btnOpenFolder, btnNewFile, btnSave;
let fileList, currentFileSpan, autoSaveIndicator;
let currentFolder = null;
let currentFile = null;
let autoSaveTimeout = null;

document.addEventListener('DOMContentLoaded', () => {
    consoleOutput = document.getElementById('consoleOutput');
    btnCompile = document.getElementById('btnCompile');
    btnOpenFolder = document.getElementById('btnOpenFolder');
    btnNewFile = document.getElementById('btnNewFile');
    btnSave = document.getElementById('btnSave');
    fileList = document.getElementById('fileList');
    currentFileSpan = document.getElementById('currentFile');
    autoSaveIndicator = document.getElementById('autoSaveIndicator');

    // Initialize Monaco Editor
    require.config({ paths: { 'vs': 'node_modules/monaco-editor/min/vs' } });
    require(['vs/editor/editor.main'], function () {
        editor = monaco.editor.create(document.getElementById('monaco-editor-container'), {
            value: [
                'ohjata <',
                '  disk intera x -> 10.',
                '>'
            ].join('\n'),
            language: 'plaintext',
            theme: 'vs-dark',
            automaticLayout: true
        });

        // Auto-save listener
        editor.onDidChangeModelContent(() => {
            if (currentFolder && currentFile) {
                clearTimeout(autoSaveTimeout);
                autoSaveIndicator.textContent = 'Salvando...';
                autoSaveIndicator.className = 'auto-save-indicator saving';

                autoSaveTimeout = setTimeout(async () => {
                    await autoSave();
                }, 1000);
            }
        });
    });

    btnCompile.addEventListener('click', compile);
    btnOpenFolder.addEventListener('click', openFolder);
    btnNewFile.addEventListener('click', createNewFile);
    btnSave.addEventListener('click', saveFile);

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
                editor.setValue('');
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
            editor.setValue(result.content);
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
    if (!editor) return;
    const code = editor.getValue();

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
        if (!editor) return;
        const content = editor.getValue();
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
        if (!editor) return;
        const content = editor.getValue();

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
