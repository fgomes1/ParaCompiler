# ParaCompiler IDE

Uma IDE moderna para a linguagem de programação paraense **COP30**, construída com Electron e Java.

## Pré-requisitos

- **Java JDK** (para compilar e rodar o backend da linguagem).
- **Node.js** e **npm** (para rodar a interface da IDE).

## Instalação e Configuração

### 1. Compilar o Backend (Java)

A IDE depende do compilador Java. Antes de rodar, você precisa compilar os arquivos fonte.

Abra um terminal na raiz do projeto (`ParaCompiler`) e execute:

```bash
mkdir bin
javac -d bin src/compiler/ParaCompiler.java
```

Isso criará os arquivos `.class` na pasta `bin`.

### 2. Instalar Dependências da IDE (Electron)

Navegue até a pasta da interface e instale as dependências:

```bash
cd VsPara
npm install
```

## Como Rodar

Para iniciar a IDE:

```bash
cd VsPara
npm start
```

## Estrutura do Projeto

- `src/compiler`: Código fonte do compilador (Java/JavaCC).
- `VsPara`: Código fonte da IDE (Electron/HTML/JS).
- `bin`: Binários compilados do Java (gerados automaticamente).

## Funcionalidades

- Editor de código com numeração de linhas (Monaco Editor).
- Compilação e execução de código `.para`.
- Gerenciamento de arquivos (Criar, Renomear, Excluir).
- Console integrado para saída do programa.
