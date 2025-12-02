# 🧪 Como Testar o ParaCompiler

Este guia mostra como compilar e testar o ParaCompiler via terminal.

## 📦 Pré-requisitos

- Java JDK instalado (versão 11 ou superior)
- Terminal aberto na pasta raiz do projeto: `c:\Users\Franciney\eclipse-workspace\ParaCompiler`

---

## 🔨 1. Compilar o Projeto

Primeiro, compile todos os arquivos Java:

```bash
javac -d bin -sourcepath src src\compiler\*.java
```

**Resultado esperado:** Nenhuma saída (silêncio = sucesso) ✅

---

## 🚀 2. Testar os Arquivos de Exemplo

### **Teste 1: Arquivo com Sucesso**

```bash
java -cp bin compiler.ParaCompiler tests\teste_sucesso.para
```

### **Teste 2: Arquivo com Erros**

```bash
java -cp bin compiler.ParaCompiler tests\teste_erro.para
```

---

## 📝 3. Modo Interativo (Digitar Código Manualmente)

Para testar código digitado diretamente no terminal:

```bash
java -cp bin compiler.ParaCompiler
```

**Depois:**
1. Digite ou cole seu código ParaCompiler
2. Pressione `Ctrl+Z` e depois `Enter` para finalizar

**Exemplo de código para testar:**
```
ohjata <
  disk intera x -> 5.
  disk intera y -> 10.
  y -> x + 3.
>
```

---

## 🌲 O que Esperar na Saída

A execução mostrará 3 seções:

1. **Resultado da Compilação** - ✅ Aceito ou ❌ Rejeitado
2. **Tokens Reconhecidos** - Lista de tokens identificados
3. **Árvore Sintática Abstrata** - Estrutura hierárquica do código

**Exemplo de saída:**
```
========================================
   RESULTADO DA COMPILAÇÃO
========================================

✅ CÓDIGO ACEITO! Tá massa, bichão!

TOKENS RECONHECIDOS:
  ohjata < disk intera IDENT:x -> NUM:5 ...

========================================
   ÁRVORE SINTÁTICA ABSTRATA
========================================

  Program
   Statement
    Declaracao
     tipoDado
     ListaId
      Ident
      Expression
       Term
        Factor
```

---

## 🛠️ Comandos Rápidos (Copie e Cole)

### Recompilar e testar arquivo de sucesso:
```bash
javac -d bin -sourcepath src src\compiler\*.java && java -cp bin compiler.ParaCompiler tests\teste_sucesso.para
```

### Recompilar e testar arquivo com erros:
```bash
javac -d bin -sourcepath src src\compiler\*.java && java -cp bin compiler.ParaCompiler tests\teste_erro.para
```

### Limpar binários e recompilar:
```bash
Remove-Item -Recurse -Force bin\* ; javac -d bin -sourcepath src src\compiler\*.java
```

---

## 📂 Estrutura de Arquivos

- **`src/compiler/`** - Código fonte do compilador
- **`bin/compiler/`** - Arquivos compilados (.class)
- **`tests/`** - Arquivos de teste (.para)

---

---

## 🌳 Visualização da Árvore Sintática

### Exportar Árvore em JSON

Para obter a árvore sintática em formato JSON (útil para integração com Electron/JavaScript):

```bash
java -cp bin compiler.ParaCompiler tests\teste_sucesso.para --json
```

**Exemplo de saída JSON:**
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

### Visualizar no Navegador

Abra o arquivo de demonstração incluído no projeto:

```bash
# Windows
start VsPara\tree-viewer.html

# Ou acesse diretamente
explorer.exe VsPara\tree-viewer.html
```

A página permite:
- ✅ Colar JSON da árvore
- ✅ Visualização interativa (clique para expandir/colapsar)
- ✅ Carregar exemplo pré-definido
- ✅ Sem necessidade de instalar bibliotecas

### Integração com Electron IDE

O módulo `VsPara\tree-visualizer.js` fornece três opções de renderização:

**1. HTML Puro (recomendado para começar):**
```javascript
const { renderTreeAsHTML, compileAndGetTree } = require('./tree-visualizer.js');

// Compilar e obter árvore
compileAndGetTree('caminho/arquivo.para').then(treeData => {
    renderTreeAsHTML(treeData, 'tree-container');
});
```

**2. vis.js Network (interativo com drag & drop):**
```bash
npm install vis-network
```
```javascript
const { renderTreeWithVisJS } = require('./tree-visualizer.js');
renderTreeWithVisJS(treeData, 'tree-container');
```

**3. D3.js (profissional):**
```bash
npm install d3
```
```javascript
const { renderTreeWithD3 } = require('./tree-visualizer.js');
renderTreeWithD3(treeData, 'tree-container');
```

---

## ✨ Dicas

- Use `>>` para redirecionar a saída para um arquivo:
  ```bash
  java -cp bin compiler.ParaCompiler tests\teste_sucesso.para >> resultado.txt
  ```

- Para ver apenas a árvore sintática, você pode filtrar a saída buscando pela seção específica

Bora testar! 🚀
