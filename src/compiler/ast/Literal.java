package compiler.ast;

public class Literal extends Expression {
    private String value;
    private String type; // INT, FLOAT, STRING

    public Literal(String value, String type) {
        this.value = value;
        this.type = type;
    }

    @Override
    public String toString(String indent) {
        return indent + "Literal(" + type + ": " + value + ")\n";
    }
}
