package compiler.ast;

import java.util.ArrayList;
import java.util.List;

public class Block extends Statement {
    private List<Statement> statements = new ArrayList<>();

    public void addStatement(Statement stmt) {
        statements.add(stmt);
    }

    @Override
    public String toString(String indent) {
        StringBuilder sb = new StringBuilder();
        sb.append(indent).append("Block\n");
        for (Statement stmt : statements) {
            sb.append(stmt.toString(indent + "  "));
        }
        return sb.toString();
    }
}
