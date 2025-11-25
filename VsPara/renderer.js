const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Elementos da UI
let codeEditor, consoleOutput, btnCompile, btnOpen, btnSave;

// Inicializar quando o DOM carregar
document.addEventListener('DOMContentLoaded', () => {
    codeEditor = document.getElementById('codeEditor');
    consoleOutput = document.getElementById('consoleOutput');
    btnCompile = document.getElementById('btnCompile');
    btnOpen = document.getElementById('btnOpen');
    btnSave = document.getElementById('btnSave');

    // Event Listeners
    btnCompile.addEventListener('click', compile);
    btnOpen.addEventListener('click', openFile);
    btnSave.addEventListener('click', saveFile);
});

// Função para compilar
function compile() {
    const code = codeEditor.value;

    if (!code.trim()) {
        updateConsole('❌ Erro: Digite algum código antes de compilar!');
        return;
    }

    updateConsole('🔄 Compilando...\n');

    // Caminho para o compilador Java (ajuste conforme necessário)
    const javaPath = 'java';
    const classPath = path.join(__dirname, '..', 'bin');

    // Executar o compilador
    const compiler = spawn(javaPath, ['-cp', classPath, 'compiler.ParaCompiler'], {
        cwd: path.join(__dirname, '..')
    });

    // Enviar código para o compilador via stdin
    compiler.stdin.write(code + '\n\n'); // Duas quebras de linha para encerrar
    compiler.stdin.end();

    let output = '';
    let error = '';

    compiler.stdout.on('data', (data) => {
        output += data.toString();
    });

    compiler.stderr.on('data', (data) => {
        error += data.toString();
    });

    compiler.on('close', (code) => {
        if (error) {
            updateConsole('❌ Erro:\n' + error);
        } else if (output) {
            updateConsole('✅ Saída:\n' + output);
        } else {
            updateConsole('⚠️ Nenhuma saída gerada.');
        }
    });

    compiler.on('error', (err) => {
        updateConsole('❌ Erro ao executar compilador:\n' + err.message + '\n\nVerifique se o Java está instalado e o código foi compilado.');
    });
}

// Função para atualizar o console
function updateConsole(message) {
    consoleOutput.textContent = message;
}

// Função para abrir arquivo
function openFile() {
    const { dialog } = require('electron').remote || require('@electron/remote');

    dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            { name: 'ParaCompiler Files', extensions: ['para', 'txt'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    }).then(result => {
        if (!result.canceled && result.filePaths.length > 0) {
            const filePath = result.filePaths[0];
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    updateConsole('❌ Erro ao abrir arquivo: ' + err.message);
                } else {
                    codeEditor.value = data;
                    updateConsole('✅ Arquivo aberto: ' + filePath);
                }
            });
        }
    });
}

// Função para salvar arquivo
function saveFile() {
    const { dialog } = require('electron').remote || require('@electron/remote');

    dialog.showSaveDialog({
        filters: [
            { name: 'ParaCompiler Files', extensions: ['para'] },
            { name: 'Text Files', extensions: ['txt'] }
        ]
    }).then(result => {
        if (!result.canceled && result.filePath) {
            const content = codeEditor.value;
            fs.writeFile(result.filePath, content, 'utf8', (err) => {
                if (err) {
                    updateConsole('❌ Erro ao salvar arquivo: ' + err.message);
                } else {
                    updateConsole('✅ Arquivo salvo: ' + result.filePath);
                }
            });
        }
    });
}
