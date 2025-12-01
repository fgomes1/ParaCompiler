package compiler.ast;

public class IfStatement extends Statement {
    private Expression condition;
    private Block thenBlock;
    private Block elseBlock;

    public IfStatement(Expression condition, Block thenBlock, Block elseBlock) {
        this.condition = condition;
        this.thenBlock = thenBlock;
        this.elseBlock = elseBlock;
    }

    @Override
    public String toString(String indent) {
        StringBuilder sb = new StringBuilder();
        sb.append(indent).append("IfStatement\n");
        sb.append(condition.toString(indent + "  "));
        sb.append(indent).append("  Then\n").append(thenBlock.toString(indent + "    "));
        if (elseBlock != null) {
            sb.append(indent).append("  Else\n").append(elseBlock.toString(indent + "    "));
        }
        return sb.toString();
    }
}
