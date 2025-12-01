# Walkthrough - Implementação do Modo Pânico

Implementei o mecanismo de recuperação de erros (Modo Pânico) no arquivo `ParaCompiler.jj`.

## Alterações Realizadas

### 1. Método `recoverFromError`
Adicionei um método auxiliar na classe `ParaCompiler` para consumir tokens até encontrar um delimitador seguro (`.` ou `>` ou `EOF`).

```java
void recoverFromError() {
    Token t;
    do {
        t = getNextToken();
    } while (t.kind != FIMINSTRUC && t.kind != FECHABLOCO && t.kind != EOF);
}
```

### 2. Tratamento de Exceção no Loop Principal
Modifiquei a regra `program()` para envolver a chamada de `statement()` em um bloco `try-catch`.

```java
// Antes
( stmt = statement() { prog.addStatement(stmt); } )*

// Depois
( 
    try {
        stmt = statement() { prog.addStatement(stmt); } 
    } catch (ParseException e) {
        System.out.println(e.toString());
        recoverFromError();
    }
)* 
```

## Como Verificar
1. Recompile o projeto usando o JavaCC.
2. Crie um arquivo `.para` com um erro de sintaxe no meio do código (ex: `disk intera x -> ;`).
3. Execute o compilador.
4. **Resultado Esperado:** O compilador deve exibir a mensagem de erro para a linha problemática, mas **continuar** compilando as linhas seguintes, em vez de abortar imediatamente.
