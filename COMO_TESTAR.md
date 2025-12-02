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

## ✨ Dicas

- Use `>>` para redirecionar a saída para um arquivo:
  ```bash
  java -cp bin compiler.ParaCompiler tests\teste_sucesso.para >> resultado.txt
  ```

- Para ver apenas a árvore sintática, você pode filtrar a saída buscando pela seção específica

Bora testar! 🚀
