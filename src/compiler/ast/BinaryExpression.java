package compiler.ast;

public class BinaryExpression extends Expression {
    private Expression left;
    private String operator;
    private Expression right;

    public BinaryExpression(Expression left, String operator, Expression right) {
        this.left = left;
        this.operator = operator;
        this.right = right;
    }

    @Override
    public String toString(String indent) {
        return indent + "BinaryExpression(" + operator + ")\n" +
                left.toString(indent + "  ") +
                right.toString(indent + "  ");
    }
}
