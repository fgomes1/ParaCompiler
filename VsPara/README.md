# 🌳 Visualizador de Árvore Sintática - ParaCompiler

## 📝 Visão Geral

Este diretório contém os módulos de visualização da árvore sintática abstrata (AST) do ParaCompiler para integração com Electron IDE.

## 📂 Arquivos

### `tree-visualizer.js`
Módulo JavaScript principal com funções para:
- Executar compilador e extrair JSON automaticamente
- 3 opções de renderização (HTML puro, vis.js, D3.js)

### `tree-viewer.html`
Página de demonstração standalone para testar visualizações sem integração Electron.

## 🚀 Uso Rápido

### 1. Visualizar no Navegador (Demo)

```bash
# Abrir a página demo
start tree-viewer.html
```

### 2. Integração Básica no Electron

```javascript
const { renderTreeAsHTML, compileAndGetTree } = require('./tree-visualizer.js');

// Compilar arquivo e renderizar árvore
compileAndGetTree('caminho/arquivo.para')
    .then(treeData => {
        renderTreeAsHTML(treeData, 'tree-container');
    })
    .catch(error => {
        console.error('Erro:', error);
    });
```

## 🎨 Opções de Visualização

### Opção 1: HTML Puro ⭐ (Recomendado para começar)

**Vantagens:**
- ✅ Sem dependências externas
- ✅ Funciona imediatamente
- ✅ Visual moderno com gradientes
- ✅ Expand/collapse interativo

```javascript
renderTreeAsHTML(treeData, 'container-id');
```

### Opção 2: vis.js Network (Interativo)

**Instalação:**
```bash
npm install vis-network
```

**Uso:**
```javascript
renderTreeWithVisJS(treeData, 'container-id');
```

**Vantagens:**
- ✅ Drag & drop de nós
- ✅ Zoom e pan
- ✅ Layout hierárquico automático

### Opção 3: D3.js (Profissional)

**Instalação:**
```bash
npm install d3
```

**Uso:**
```javascript
renderTreeWithD3(treeData, 'container-id');
```

**Vantagens:**
- ✅ Visualização profissional
- ✅ Altamente customizável
- ✅ Padrão acadêmico

## 📖 API do Módulo

### `compileAndGetTree(filePath, compilerPath)`

Compila um arquivo .para e retorna a árvore em JSON.

**Parâmetros:**
- `filePath` (string): Caminho para o arquivo .para
- `compilerPath` (string, opcional): Caminho do diretório do compilador

**Retorna:** `Promise<object>` - JSON da árvore

**Exemplo:**
```javascript
compileAndGetTree('tests/teste.para')
    .then(tree => console.log(tree))
    .catch(err => console.error(err));
```

### `renderTreeAsHTML(treeData, containerId)`

Renderiza árvore como HTML colapsável.

**Parâmetros:**
- `treeData` (object): JSON da árvore
- `containerId` (string): ID do elemento container

### `renderTreeWithVisJS(treeData, containerId)`

Renderiza com vis.js Network (requer biblioteca instalada).

### `renderTreeWithD3(treeData, containerId)`

Renderiza com D3.js (requer biblioteca instalada).

## 🛠️ Estrutura do JSON

O compilador com flag `--json` gera:

```json
{
  "type": "Program",
  "children": [
    {
      "type": "Statement",
      "children": [
        {
          "type": "Declaracao",
          "value": "intera",
          "children": [ ... ]
        }
      ]
    }
  ]
}
```

**Campos:**
- `type` (string): Tipo do nó (ex: "Program", "Statement", "Expression")
- `value` (string, opcional): Valor associado (ex: nome de variável, número)
- `children` (array): Nós filhos

## 💡 Exemplos de Integração

### Electron - Main Process
```javascript
const { ipcMain } = require('electron');
const { compileAndGetTree } = require('./tree-visualizer');

ipcMain.handle('compile-file', async (event, filePath) => {
    try {
        return await compileAndGetTree(filePath);
    } catch (error) {
        throw error;
    }
});
```

### Electron - Renderer Process
```javascript
const { ipcRenderer } = require('electron');

document.getElementById('compile-btn').addEventListener('click', async () => {
    const filePath = document.getElementById('file-path').value;
    try {
        const treeData = await ipcRenderer.invoke('compile-file', filePath);
        renderTreeAsHTML(treeData, 'tree-display');
    } catch (error) {
        console.error('Erro na compilação:', error);
    }
});
```

## 🎯 Customização

### Alterar Cores dos Nós (HTML Puro)

Edite o CSS em `renderTreeAsHTML()`:

```javascript
.tree-node-label {
    background: linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%);
    /* Substitua pelos gradientes desejados */
}
```

### Personalizar Layout (vis.js)

```javascript
const options = {
    layout: {
        hierarchical: {
            direction: 'LR',  // Esquerda para direita
            sortMethod: 'directed'
        }
    }
};
```

## ❓ Solução de Problemas

**Erro: "vis is not defined"**
- Instale: `npm install vis-network`
- Ou inclua via CDN no HTML

**Erro: "d3 is not defined"**
- Instale: `npm install d3`
- Ou inclua via CDN no HTML

**JSON não aparece na saída**
- Verifique se está usando flag `--json`
- Comando: `java -cp bin compiler.ParaCompiler arquivo.para --json`

## 📚 Documentação Completa

Ver arquivo principal: [COMO_TESTAR.md](../COMO_TESTAR.md#-visualização-da-árvore-sintática)

## 🤝 Contribuindo

Para adicionar novos formatos de visualização:
1. Criar nova função `renderTreeWith...()` em `tree-visualizer.js`
2. Documentar no README
3. Adicionar exemplo em `tree-viewer.html`

---

**Desenvolvido para ParaCompiler** 🚀
