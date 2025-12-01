package compiler.ast;

public class TestAST {
    public static void main(String[] args) {
        // Program
        Program prog = new Program();

        // var x = 10;
        Declaration decl = new Declaration("INT");
        decl.addVariable("x", new Literal("10", "INT"));
        prog.addStatement(decl);

        // if (x > 5) { x = x - 1; }
        Expression cond = new BinaryExpression(new Identifier("x"), ">", new Literal("5", "INT"));
        Block thenBlock = new Block();
        thenBlock.addStatement(
                new Assignment("x", new BinaryExpression(new Identifier("x"), "-", new Literal("1", "INT"))));
        IfStatement ifStmt = new IfStatement(cond, thenBlock, null);
        prog.addStatement(ifStmt);

        System.out.println(prog.toString());
    }
}
