package compiler.ast;

public class Assignment extends Statement {
    private String identifier;
    private Expression expression;

    public Assignment(String identifier, Expression expression) {
        this.identifier = identifier;
        this.expression = expression;
    }

    @Override
    public String toString(String indent) {
        return indent + "Assignment(" + identifier + ")\n" +
                expression.toString(indent + "  ");
    }
}
