/**
 * 🌳 Tree Visualizer for ParaCompiler
 * Módulo JavaScript para visualizar a árvore sintática do ParaCompiler no Electron
 * 
 * @author ParaCompiler Team
 * @version 1.0.0
 */

const { exec } = require('child_process');
const path = require('path');

/**
 * Execute o compilador ParaCompiler e retorna a árvore sintática em JSON
 * 
 * @param {string} filePath - Caminho para o arquivo .para a ser compilado
 * @param {string} compilerPath - Caminho para o diretório do compilador (opcional)
 * @returns {Promise<object>} - Promise que resolve com o JSON da árvore
 */
function compileAndGetTree(filePath, compilerPath = 'c:/Users/Franciney/eclipse-workspace/ParaCompiler') {
    return new Promise((resolve, reject) => {
        const command = `java -cp bin compiler.ParaCompiler "${filePath}" --json`;

        exec(command, { cwd: compilerPath, encoding: 'utf8' }, (error, stdout, stderr) => {
            if (error && !stdout) {
                reject(new Error(`Erro ao executar compilador: ${error.message}`));
                return;
            }

            try {
                // Extrair JSON da saída
                const jsonMatch = stdout.match(/JSON DA ÁRVORE.*?\n={40}\n\n([\s\S]*?)(?=\n\n|$)/);
                if (jsonMatch && jsonMatch[1]) {
                    const treeJson = JSON.parse(jsonMatch[1].trim());
                    resolve(treeJson);
                } else {
                    reject(new Error('JSON da árvore não encontrado na saída'));
                }
            } catch (parseError) {
                reject(new Error(`Erro ao parsear JSON: ${parseError.message}`));
            }
        });
    });
}

// ============================================================
// OPÇÃO 1: Renderização em HTML Puro (sem dependências)
// ============================================================

/**
 * Renderiza a árvore como HTML colapsável/expansível
 * Não requer bibliotecas externas!
 */
function renderTreeAsHTML(treeData, containerId = 'tree-container') {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container #${containerId} não encontrado`);
        return;
    }

    container.innerHTML = `
        <style>
            .tree-node { margin-left: 20px; font-family: 'Consolas', monospace; }
            .tree-node-label { 
                cursor: pointer; 
                padding: 4px 8px; 
                margin: 2px 0;
                border-radius: 4px;
                display: inline-block;
                background: #f0f0f0;
                transition: background 0.2s;
            }
            .tree-node-label:hover { background: #e0e0e0; }
            .tree-node-type { font-weight: bold; color: #0066cc; }
            .tree-node-value { color: #cc0000; font-style: italic; }
            .tree-children { margin-top: 4px; }
            .tree-children.collapsed { display: none; }
            .tree-toggle { 
                color: #666; 
                font-weight: bold; 
                margin-right: 5px;
                user-select: none;
            }
        </style>
        ${buildTreeHTML(treeData)}
    `;

    // Adicionar eventos de clique para colapsar/expandir
    container.querySelectorAll('.tree-node-label').forEach(label => {
        label.addEventListener('click', function (e) {
            e.stopPropagation();
            const children = this.nextElementSibling;
            const toggle = this.querySelector('.tree-toggle');
            if (children && children.classList.contains('tree-children')) {
                children.classList.toggle('collapsed');
                if (toggle) {
                    toggle.textContent = children.classList.contains('collapsed') ? '▶' : '▼';
                }
            }
        });
    });
}

function buildTreeHTML(node, level = 0) {
    const hasChildren = node.children && node.children.length > 0;
    const toggle = hasChildren ? '<span class="tree-toggle">▼</span>' : '';

    let html = `<div class="tree-node">`;
    html += `<div class="tree-node-label">`;
    html += toggle;
    html += `<span class="tree-node-type">${node.type}</span>`;
    if (node.value) {
        html += ` <span class="tree-node-value">=&gt; ${node.value}</span>`;
    }
    html += `</div>`;

    if (hasChildren) {
        html += `<div class="tree-children">`;
        node.children.forEach(child => {
            html += buildTreeHTML(child, level + 1);
        });
        html += `</div>`;
    }

    html += `</div>`;
    return html;
}

// ============================================================
// OPÇÃO 2: Renderização com vis.js Network
// Requer: npm install vis-network
// ============================================================

/**
 * Renderiza a árvore usando vis.js Network (interativo, com drag & drop)
 * 
 * @param {object} treeData - Dados JSON da árvore
 * @param {string} containerId - ID do elemento HTML container
 */
function renderTreeWithVisJS(treeData, containerId = 'tree-container') {
    // Verificar se vis.js está disponível
    if (typeof vis === 'undefined') {
        console.error('vis.js não está carregado! Instale com: npm install vis-network');
        return;
    }

    const nodes = [];
    const edges = [];
    let nodeId = 0;

    function traverse(node, parentId = null) {
        const currentId = nodeId++;
        const label = node.value ? `${node.type}\n${node.value}` : node.type;

        nodes.push({
            id: currentId,
            label: label,
            shape: 'box',
            margin: 10,
            font: { multi: true },
            color: {
                background: node.type === 'Program' ? '#ffcccc' :
                    node.type.includes('Statement') ? '#ccffcc' :
                        node.type.includes('Expression') || node.type.includes('Term') ? '#ccccff' :
                            '#ffffcc'
            }
        });

        if (parentId !== null) {
            edges.push({
                from: parentId,
                to: currentId,
                arrows: 'to',
                color: { color: '#666666' }
            });
        }

        if (node.children && node.children.length > 0) {
            node.children.forEach(child => traverse(child, currentId));
        }
    }

    traverse(treeData);

    const container = document.getElementById(containerId);
    const data = { nodes: new vis.DataSet(nodes), edges: new vis.DataSet(edges) };
    const options = {
        layout: {
            hierarchical: {
                direction: 'UD',
                sortMethod: 'directed',
                nodeSpacing: 150,
                levelSeparation: 100
            }
        },
        physics: false,
        edges: {
            smooth: { type: 'cubicBezier' }
        }
    };

    new vis.Network(container, data, options);
}

// ============================================================
// OPÇÃO 3: Renderização com D3.js
// Requer: npm install d3
// ============================================================

/**
 * Renderiza a árvore usando D3.js (profissional, altamente customizável)
 * 
 * @param {object} treeData - Dados JSON da árvore
 * @param {string} containerId - ID do elemento HTML container
 */
function renderTreeWithD3(treeData, containerId = 'tree-container') {
    // Verificar se D3 está disponível
    if (typeof d3 === 'undefined') {
        console.error('D3.js não está carregado! Instale com: npm install d3');
        return;
    }

    const container = document.getElementById(containerId);
    container.innerHTML = ''; // Limpar container

    const width = container.offsetWidth || 800;
    const height = 600;

    const svg = d3.select(`#${containerId}`)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', 'translate(40,40)');

    const tree = d3.tree().size([height - 80, width - 160]);
    const root = d3.hierarchy(treeData, d => d.children);
    tree(root);

    // Links
    svg.selectAll('.link')
        .data(root.links())
        .enter().append('path')
        .attr('class', 'link')
        .attr('fill', 'none')
        .attr('stroke', '#ccc')
        .attr('stroke-width', 2)
        .attr('d', d3.linkHorizontal()
            .x(d => d.y)
            .y(d => d.x));

    // Nodes
    const node = svg.selectAll('.node')
        .data(root.descendants())
        .enter().append('g')
        .attr('class', 'node')
        .attr('transform', d => `translate(${d.y},${d.x})`);

    node.append('circle')
        .attr('r', 5)
        .attr('fill', '#4CAF50');

    node.append('text')
        .attr('dy', 3)
        .attr('x', d => d.children ? -10 : 10)
        .style('text-anchor', d => d.children ? 'end' : 'start')
        .style('font-size', '12px')
        .text(d => {
            const type = d.data.type;
            const value = d.data.value ? `: ${d.data.value}` : '';
            return type + value;
        });
}

// ============================================================
// EXPORTAÇÃO DO MÓDULO
// ============================================================

module.exports = {
    compileAndGetTree,
    renderTreeAsHTML,
    renderTreeWithVisJS,
    renderTreeWithD3
};
