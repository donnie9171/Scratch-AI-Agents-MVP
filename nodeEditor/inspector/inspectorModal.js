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

    // Add the type of the currently active node as a class to the inspector-tool-panel
    if (toolPanel) {
        toolPanel.className = ''; // Clear existing classes
        toolPanel.classList.add(`node-type-${node.type}`);
    }

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
            script.src = `nodeEditor/inspector/inspectorPanelTool_${node.toolType}.js`;
            script.onload = renderPanel;
            document.body.appendChild(script);
        } else {
            // If script is loading, wait for it to load and then render
            setTimeout(renderPanel, 100);
        }
    } else if (node.type === 'agent') {
        // Load the agent panel script
        const scriptId = 'inspector-panel-agent';
        if (!document.getElementById(scriptId)) {
            const script = document.createElement('script');
            script.id = scriptId;
            script.src = 'nodeEditor/inspector/inspectorPanelAgent.js';
            script.onload = renderPanel;
            document.body.appendChild(script);
        } else {
            // If script is loading, wait for it to load and then render
            setTimeout(renderPanel, 100);
        }
    } else if (node.type === 'broadcaster') {
        // Load the broadcaster panel script
        const scriptId = 'inspector-panel-broadcaster';
        if (!document.getElementById(scriptId)) {
            const script = document.createElement('script');
            script.id = scriptId;
            script.src = 'nodeEditor/inspector/inspectorPanelBroadcaster.js';
            script.onload = renderPanel;
            document.body.appendChild(script);
        } else {
            // If script is loading, wait for it to load and then render
            setTimeout(renderPanel, 100);
        }
    } else if (node.type === 'receiver') {
        // Load the receiver panel script
        const scriptId = 'inspector-panel-receiver';
        if (!document.getElementById(scriptId)) {
            const script = document.createElement('script');
            script.id = scriptId; 
                        script.src = 'nodeEditor/inspector/inspectorPanelReceiver.js';
            script.onload = renderPanel;
            document.body.appendChild(script);
        } else {
            // If script is loading, wait for it to load and then render
            setTimeout(renderPanel, 100);
        }
        
    }else if (node.type === 'comment') {
        // Load the comment panel script
        const scriptId = 'inspector-panel-comment';
        if (!document.getElementById(scriptId)) {
            const script = document.createElement('script');
            script.id = scriptId;
            script.src = 'nodeEditor/inspector/inspectorPanelComment.js';
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
    window.runNodeCluster(currentInspectedNodeId);
}

window.showInspector = showInspector;

function updateAgentPanel() {
    const panelEl = document.getElementById('inspector-tool-panel');
    if (!panelEl) {
        return;
    }
    const promptEl = panelEl.querySelector('#agent-prompt');
    const inferenceEl = panelEl.querySelector('#agent-inference');

    if (!promptEl || !inferenceEl) {
        return;
    }

    if (window.runtimeState.getNodeState(window.currentInspectedNodeId) && window.runtimeState.getNodeState(window.currentInspectedNodeId).prompt) {
        promptEl.textContent = window.runtimeState.getNodeState(window.currentInspectedNodeId).prompt;
    } else {
        promptEl.textContent = 'No prompt set';
    }

    if (window.runtimeState.getNodeState(window.currentInspectedNodeId) && window.runtimeState.getNodeState(window.currentInspectedNodeId).inference) {
        inferenceEl.textContent = window.runtimeState.getNodeState(window.currentInspectedNodeId).inference;
    } else {
        inferenceEl.textContent = 'No inference yet';
    }
}

window.updateAgentPanel = updateAgentPanel;

// Add a resizable handle to the inspector modal
const inspectorModal = document.getElementById('inspector-modal');
inspectorModal.style.height = '45vh';
const resizeHandle = document.createElement('div');
resizeHandle.id = 'inspector-resize-handle';
inspectorModal.appendChild(resizeHandle);

let isResizing = false;
let startY = 0;
let startHeight = 0;

resizeHandle.addEventListener('mousedown', function(e) {
    isResizing = true;
    startY = e.clientY;
    startHeight = inspectorModal.offsetHeight;
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';
});

document.addEventListener('mousemove', function(e) {
    if (!isResizing) return;
    const deltaY = startY - e.clientY;
    inspectorModal.style.height = `${startHeight + deltaY}px`;
});

document.addEventListener('mouseup', function() {
    if (isResizing) {
        isResizing = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
    }
});