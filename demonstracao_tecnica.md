# Demonstração Técnica: Compilador Paraense

Este documento detalha os passos para garantir que a linguagem seja LL(1), a implementação da recuperação de erros (Modo Pânico) e a estrutura da Interface Gráfica.

## 1. Transformação para LL(1)

Uma linguagem é LL(1) se puder ser analisada por um parser descendente recursivo sem backtracking, usando apenas 1 token de lookahead. O JavaCC gera parsers LL(k), mas para garantir eficiência e simplicidade (LL(1)), devemos tratar dois problemas principais:

### A. Eliminação de Recursão à Esquerda
Recursão à esquerda ocorre quando uma regra chama a si mesma no início. Exemplo teórico:
`A -> A alpha | beta`
Isso causa loop infinito em parsers descendentes.
**Solução:** Transformar em iteração (recursão à direita ou loop).
`A -> beta A'`
`A' -> alpha A' | epsilon`

**No seu código (`ParaCompiler.jj`):**
A regra `expression` já está tratada corretamente usando iteração (loops `()*`) em vez de recursão direta:
```java
// Exemplo do seu código (linhas 219-220)
left = term() ( ( op = < PLUS > | op = < MINUS > ) right = term() { ... } )*
```
Isso é equivalente a eliminar a recursão à esquerda da gramática de expressões clássica (`E -> E + T`).

### B. Fatoração à Esquerda (Left Factoring)
Ocorre quando duas alternativas começam com o mesmo símbolo.
`A -> alpha beta | alpha gamma`
O parser não sabe qual escolher apenas olhando `alpha`.
**Solução:** Fatorar o prefixo comum.
`A -> alpha A'`
`A' -> beta | gamma`

**No seu código:**
Na regra `statement`, temos um caso interessante de fatoração manual/procedural:
```java
// Linhas 150-164
| expr = expression()
  (
    <ATRIBUICAO> ... // É uma atribuição
  |
    { stmt = expr; } // É apenas uma expressão
  )
```
Como tanto uma *atribuição* (ex: `x -> 10`) quanto uma *expressão* (ex: `x + 10`) podem começar com um identificador (`x`), o código lê a `expression` primeiro e *depois* decide se é uma atribuição ou não, verificando o próximo token. Isso resolve o conflito LL(1).

---

## 2. Sincronização do Pânico (Panic Mode)

O "Modo Pânico" permite que o compilador se recupere de um erro de sintaxe, pule tokens problemáticos até um ponto seguro (sincronização) e continue compilando para encontrar mais erros, em vez de parar no primeiro.

### Implementação
Devemos envolver a chamada das instruções (`statement`) em um bloco `try-catch` dentro do loop principal.

**Código Atual (ParaCompiler.jj):**
```java
// Linha 135
< INICIOPROG > < ABREBLOCO > ( stmt = statement() { prog.addStatement(stmt); } )* < FECHABLOCO > <EOF>
```

**Código com Modo Pânico (Proposto):**
Modifique a regra `program` para:

```java
Program program() :
{
    Program prog = new Program();
    Statement stmt;
}
{
    < INICIOPROG > < ABREBLOCO > 
    ( 
        try {
            stmt = statement() 
            { prog.addStatement(stmt); }
        } catch (ParseException e) {
            System.out.println("ERRO DE SINTAXE RECUPERADO: " + e.getMessage());
            recoverFromError(); // Chama função auxiliar
        }
    )* 
    < FECHABLOCO > <EOF>
    { return prog; }
}
```

E adicione a função auxiliar `recoverFromError` na classe `ParaCompiler` (bloco `PARSER_BEGIN`):

```java
JAVACODE
void recoverFromError() {
    Token t;
    do {
        t = getNextToken();
    } while (t.kind != FIMINSTRUC && t.kind != FECHABLOCO && t.kind != EOF);
    
    // Se consumiu um FIMINSTRUC, perfeito. 
    // Se foi FECHABLOCO ou EOF, precisamos recuar ou tratar adequadamente para não quebrar o loop externo.
}
```
*Nota: Em JavaCC puro, `JAVACODE` permite escrever métodos Java auxiliares.*

---

## 3. Interface Gráfica (Integração)

A interface gráfica é construída com **Electron**, separada em dois processos principais que se comunicam via IPC (Inter-Process Communication).

### Estrutura

1.  **Frontend (Renderer Process)**: `renderer.js` + `index.html`
    *   Usa **Monaco Editor** (o mesmo do VS Code) para edição de código.
    *   Captura o clique no botão "Compilar".
    *   Envia o código para o processo principal via `window.electronAPI.compile(code)`.

2.  **Backend (Main Process)**: `main.js`
    *   Recebe a requisição de compilação.
    *   Usa `child_process.spawn` para executar o comando Java real.

### O Código de Integração (`main.js`)

Aqui está a "mágica" que conecta a GUI ao seu compilador Java:

```javascript
// VsPara/main.js (linhas 59-93)
ipcMain.handle('compile:code', async (event, code) => {
    return new Promise((resolve, reject) => {
        const javaPath = 'java';
        // Define onde estão os .class compilados
        const classPath = path.join(__dirname, '..', 'bin'); 

        // Executa: java -cp ../bin compiler.ParaCompiler
        const compiler = spawn(javaPath, ['-cp', classPath, 'compiler.ParaCompiler'], {
            cwd: path.join(__dirname, '..')
        });

        // Envia o código do editor para a entrada padrão (stdin) do Java
        compiler.stdin.write(code + '\n\n');
        compiler.stdin.end();

        // Captura a saída (System.out.println do Java)
        compiler.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        // ... resolve a Promise com o output
    });
});
```

### Resumo do Fluxo
1.  Usuário digita código na GUI.
2.  GUI envia string do código para o Node.js (`main.js`).
3.  Node.js inicia o processo Java (`ParaCompiler`).
4.  Node.js escreve o código no `System.in` do Java.
5.  Java compila e escreve no `System.out`.
6.  Node.js lê o `System.out` e devolve para a GUI exibir no console.
