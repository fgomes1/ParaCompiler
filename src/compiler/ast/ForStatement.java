package compiler.ast;

public class ForStatement extends Statement {
    private Declaration init;
    private Expression condition;
    private Statement increment;
    private Block body;

    public ForStatement(Declaration init, Expression condition, Statement increment, Block body) {
        this.init = init;
        this.condition = condition;
        this.increment = increment;
        this.body = body;
    }

    @Override
    public String toString(String indent) {
        return indent + "ForStatement\n" +
                (init != null ? init.toString(indent + "  ") : "") +
                (condition != null ? condition.toString(indent + "  ") : "") +
                (increment != null ? increment.toString(indent + "  ") : "") +
                body.toString(indent + "  ");
    }
}
