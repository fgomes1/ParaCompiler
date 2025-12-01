package compiler.ast;

public abstract class ASTNode {
    public abstract String toString(String indent);

    @Override
    public String toString() {
        return toString("");
    }
}
