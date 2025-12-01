package compiler.ast;

import java.util.ArrayList;
import java.util.List;

public class Declaration extends Statement {
    private String type;
    private List<String> identifiers = new ArrayList<>();
    private List<Expression> initializers = new ArrayList<>();

    public Declaration(String type) {
        this.type = type;
    }

    public void addVariable(String id, Expression init) {
        identifiers.add(id);
        initializers.add(init);
    }

    @Override
    public String toString(String indent) {
        StringBuilder sb = new StringBuilder();
        sb.append(indent).append("Declaration(").append(type).append(")\n");
        for (int i = 0; i < identifiers.size(); i++) {
            sb.append(indent).append("  ").append(identifiers.get(i));
            if (initializers.get(i) != null) {
                sb.append(" = \n").append(initializers.get(i).toString(indent + "    "));
            } else {
                sb.append("\n");
            }
        }
        return sb.toString();
    }
}
