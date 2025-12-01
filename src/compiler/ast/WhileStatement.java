package compiler.ast;

public class WhileStatement extends Statement {
    private Expression condition;
    private Block body;

    public WhileStatement(Expression condition, Block body) {
        this.condition = condition;
        this.body = body;
    }

    @Override
    public String toString(String indent) {
        return indent + "WhileStatement\n" +
                condition.toString(indent + "  ") +
                body.toString(indent + "  ");
    }
}
