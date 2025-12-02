# 🌳 Como Adicionar a Visualização da Árvore Sintática na IDE

## Mudanças Necessárias

### 1. Modificar `index.html`

Substitua a seção do console (linhas 66-71) por:

```html
<!-- Right Sidebar with Tabs -->
<div class="right-sidebar">
    <div class="tab-header">
        <div class="tab-button active" data-tab="console">Console</div>
        <div class="tab-button" data-tab="tree">Árvore</div>
    </div>
    <div class="tab-content">
        <div id="consoleTab" class="tab-pane active">
            <div id="consoleOutput" class="console-content">
                Pronto para compilar...
            </div>
        </div>
        <div id="treeTab" class="tab-pane">
            <div id="treeContainer" class="tree-content">
                <div class="tree-placeholder">Compile o código para visualizar a árvore sintática</div>
            </div>
        </div>
    </div>
</div>
```

**Resultado:** Agora o console será uma aba ao lado da árvore!

---

### 2. Modificar `styles.css`

O CSS para as tabs já foi adicionado ao final do arquivo! ✅

---

### 3. Adicionar handler no `main.js`

Adicione este novo handler ANTES da linha `app.whenReady()`:

```javascript
ipcMain.handle('compile:with-json', async (event, code) => {
    return new Promise((resolve, reject) => {
        const javaPath = 'java';
        const classPath = path.join(__dirname, '..', 'bin');

        // Criar arquivo temporário para stdin
        const tempFile = path.join(__dirname, '..', 'temp_input.para');
        fs.writeFileSync(tempFile, code, 'utf8');

        const compiler = spawn(javaPath, [
            '-cp', classPath, 
            'compiler.ParaCompiler', 
            tempFile,
            '--json'
        ], {
            cwd: path.join(__dirname, '..')
        });

        let output = '';
        let error = '';

        compiler.stdout.on('data', (data) => {
            output += data.toString();
        });

        compiler.stderr.on('data', (data) => {
            error += data.toString();
        });

        compiler.on('close', (exitCode) => {
            // Limpar arquivo temporário
            try { fs.unlinkSync(tempFile); } catch(e) {}
            
            // Extrair JSON
            const jsonMatch = output.match(/JSON DA ÁRVORE.*?\n={40}\n\n([\s\S]*?)(?=\n\n|$)/);
            let treeJson = null;
            
            if (jsonMatch) {
                try {
                    treeJson = JSON.parse(jsonMatch[1].trim());
                } catch(e) {
                    console.error('Erro ao parsear JSON:', e);
                }
            }
            
            resolve({ output, error, exitCode, treeJson });
        });

        compiler.on('error', (err) => {
            reject({ error: err.message });
        });
    });
});
```

---

### 4. Modificar `preload.js`

Adicione no objeto `electronAPI`:

```javascript
compileWithJson: (code) => ipcRenderer.invoke('compile:with-json', code)
```

---

### 5. Modificar `renderer.js`

#### 5.1 Adicionar variáveis no topo:

Após a linha 10, adicione:

```javascript
let currentTab = 'console';
```

#### 5.2 Adicionar event listeners no `DOMContentLoaded`:

Após a linha 65, adicione:

```javascript
// Tab switching
document.querySelectorAll('.tab-button').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});
```

#### 5.3 Substituir a função `compile()`:

Localize a função `compile()` (linha 210) e substitua por:

```javascript
async function compile() {
    if (!editor) return;
    const code = editor.getValue();

    if (!code.trim()) {
        updateConsole('❌ Erro: Digite algum código antes de compilar!');
        return;
    }

    updateConsole('🔄 Compilando...\n');

    try {
        const result = await window.electronAPI.compileWithJson(code);

        if (result.error) {
            updateConsole('❌ Erro:\n' + result.error);
        } else if (result.output) {
            updateConsole('✅ Saída:\n' + result.output);
            
            // Renderizar árvore se houver JSON
            if (result.treeJson) {
                renderTree(result.treeJson);
                // Mudar automaticamente para aba da ármore
                switchTab('tree');
            }
        } else {
            updateConsole('⚠️ Nenhuma saída gerada.');
        }
    } catch (err) {
        updateConsole('❌ Erro ao executar compilador:\n' + err.message);
    }
}
```

#### 5.4 Adicionar funções no final do arquivo:

```javascript
function switchTab(tabName) {
    currentTab = tabName;
    
    // Atualizar botões
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
    // Atualizar painéis
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    
    if (tabName === 'console') {
        document.getElementById('consoleTab').classList.add('active');
    } else if (tabName === 'tree') {
        document.getElementById('treeTab').classList.add('active');
    }
}

function renderTree(treeData) {
    const container = document.getElementById('treeContainer');
    container.innerHTML = buildTreeHTML(treeData);
    
    // Adicionar eventos de clique
    container.querySelectorAll('.tree-label').forEach(label => {
        label.addEventListener('click', function(e) {
            e.stopPropagation();
            const children = this.nextElementSibling;
            if (children && children.classList.contains('tree-children')) {
                children.classList.toggle('collapsed');
            }
        });
    });
}

function buildTreeHTML(node) {
    const hasChildren = node.children && node.children.length > 0;
    const toggle = hasChildren ? '▼ ' : '';
    
    let html = '<div class="tree-node">';
    html += '<div class="tree-label">';
    html += toggle + '<strong>' + node.type + '</strong>';
    if (node.value) {
        html += ' <span class="tree-value">= ' + node.value + '</span>';
    }
    html += '</div>';
    
    if (hasChildren) {
        html += '<div class="tree-children">';
        node.children.forEach(child => {
            html += buildTreeHTML(child);
        });
        html += '</div>';
    }
    
    html += '</div>';
    return html;
}
```

---

## ✅ Checklist de Implementação

- [ ] Modificar `index.html` - substituir console-area por right-sidebar
- [ ] CSS já foi adicionado ✓
- [ ]  Adicionar handler `compile:with-json` no `main.js`
- [ ] Expor função no `preload.js`
- [ ] Modificar `renderer.js`:
  - [ ] Adicionar variável `currentTab`
  - [ ] Adicionar event listeners para tabs
  - [ ] Substituir função `compile()`
  - [ ] Adicionar funções `switchTab()`, `renderTree()`, `buildTreeHTML()`

---

## 🎯 Resultado Final

Após implementar todas as mudanças:

1. **Lado esquerdo:** Explorador de arquivos
2. **Centro:** Editor de código Monaco
3. **Lado direito:** Tabs com:
   - **Console:** Saída do compilador
   - **Árvore:** Visualização interativa da árvore sintática

Quando compilar, a árvore será renderizada automaticamente e a aba mudará para mostrar! 🌳✨
