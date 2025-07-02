document.addEventListener('DOMContentLoaded', function() {
    // Open inspector when a node is clicked
    document.getElementById('container').addEventListener('click', function(e) {
        const card = e.target.closest('.card');
        if (card) {
            const nodeId = card.dataset.id;
            const node = window.nodeData?.find(n => n.id === nodeId);
            if (node) {
                showInspector(node);
            }
        }
    });
});

let currentInspectedNodeId = null;

// Registry for tool panel renderers
window.inspectorToolPanels = {};

// Example: Register a panel for "tool" type nodes
window.inspectorToolPanels['tool'] = function(node, panelEl) {
    panelEl.innerHTML = `<div style="color:#fff;">Custom Tool Panel for ${node.data?.label || node.id}</div>`;
    // You can add more logic here or import from another JS file
};

function showInspector(node) {
    window.currentInspectedNodeId = node.id;
    // Remove previous selection
    document.querySelectorAll('.card.selected').forEach(el => el.classList.remove('selected'));
    currentInspectedNodeId = node.id;
    // Highlight the selected node
    const card = document.querySelector(`.card[data-id="${node.id}"]`);
    if (card) card.classList.add('selected');

    // Editable label input
    document.getElementById('inspector-title').innerHTML = `
        <input id="inspector-label-input" type="text" value="${node.data?.label || node.id}" style="font-size:1.2em; width:90%; padding:4px; border-radius:6px; border:1px solid #888; background:#18192a; color:#fff;">
    `;

    const dataCluster = window.runtimeState.getNodeState(node.id).cluster;
    const dataSortOrder = window.runtimeState.getNodeState(node.id).sortOrder;

    document.getElementById('inspector-details').innerHTML = `
        <p>Cluster: ${dataCluster}</p>
        <p>Sort order: ${dataSortOrder}</p>
        <p>Node data:</p>
        <pre>${JSON.stringify(node, null, 2)}</pre>
    `;

// Render tool panel if available
    const toolPanel = document.getElementById('inspector-tool-panel');
    toolPanel.innerHTML = '';

    // Determine the panel key (for tools, use toolType if present)
    let panelKey = node.type;
    if (node.type === 'tool' && node.toolType) {
        panelKey = `tool:${node.toolType}`;
    }

    // Function to render the panel if registered
    function renderPanel() {
        const panelRenderer = window.inspectorToolPanels[panelKey] || window.inspectorToolPanels[node.type];
        if (panelRenderer) {
            panelRenderer(node, toolPanel);
        }
    }

    // If the panel is already registered, render it
    if (window.inspectorToolPanels[panelKey]) {
        renderPanel();
    } else if (node.type === 'tool' && node.toolType) {
        // Try to load the JS file for this tool type
        const scriptId = `inspector-panel-${node.toolType}`;
        if (!document.getElementById(scriptId)) {
            const script = document.createElement('script');
            script.id = scriptId;
            script.src = `inspectorPanelTool_${node.toolType}.js`;
            script.onload = renderPanel;
            document.body.appendChild(script);
        } else {
            // If script is loading, wait for it to load and then render
            setTimeout(renderPanel, 100);
        }
    } else {
        renderPanel();
    }

    document.getElementById('inspector-modal').classList.add('active');
    document.body.classList.add('inspector-open');

    // Save label on input change
    const labelInput = document.getElementById('inspector-label-input');
    labelInput.addEventListener('change', function() {
        node.data = node.data || {};
        node.data.label = labelInput.value;
        const saveObj = {
    metadata: {
        lastScratchProjectId: window.lastScratchProjectId || null
    },
    nodes: window.nodeData
};
localStorage.setItem('nodes', JSON.stringify(saveObj));
        if (window.loadNodes) window.loadNodes();
    });
}

document.getElementById('delete-inspector').onclick = function() {
    if (!currentInspectedNodeId || !window.nodeData) return;
    // Remove the node
    window.nodeData = window.nodeData.filter(n => n.id !== currentInspectedNodeId);
    // Remove connections to/from this node
    window.nodeData.forEach(n => {
        n.inputs = (n.inputs || []).filter(id => id !== currentInspectedNodeId);
        n.outputs = (n.outputs || []).filter(id => id !== currentInspectedNodeId);
    });
    const saveObj = {
    metadata: {
        lastScratchProjectId: window.lastScratchProjectId || null
    },
    nodes: window.nodeData
};
localStorage.setItem('nodes', JSON.stringify(saveObj));
    if (window.loadNodes) window.loadNodes();
    document.getElementById('inspector-modal').classList.remove('active');
    document.body.classList.remove('inspector-open');
    // Remove selection highlight
    document.querySelectorAll('.card.selected').forEach(el => el.classList.remove('selected'));
    currentInspectedNodeId = null;
};

document.getElementById('close-inspector').onclick = function() {
    document.getElementById('inspector-modal').classList.remove('active');
    document.body.classList.remove('inspector-open');
    // Remove selection highlight
    document.querySelectorAll('.card.selected').forEach(el => el.classList.remove('selected'));
    currentInspectedNodeId = null;
};

document.getElementById('run-inspector').onclick = function() {
    if (!currentInspectedNodeId || !window.nodeData) return;
    console.log(`Running node: ${currentInspectedNodeId}`);
    window.runNodeCluster(currentInspectedNodeId);
}

window.showInspector = showInspector;