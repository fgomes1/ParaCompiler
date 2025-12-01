package compiler.ast;

public class Identifier extends Expression {
    private String name;

    public Identifier(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    @Override
    public String toString(String indent) {
        return indent + "Identifier(" + name + ")\n";
    }
}
