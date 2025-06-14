// This assumes you draw connections as SVG lines or on canvas. We'll use a global for hovered connection.
window.cutMode = false;
window.hoveredConnection = null;

const cutBtn = document.getElementById('cut');

function setCutMode(active) {
    window.cutMode = active;
    if (active) {
        document.body.classList.add('cut-mode');
        cutBtn.textContent = 'Exit Cut Mode';
        document.getElementById('cut-tooltip').style.display = 'block';
    } else {
        document.body.classList.remove('cut-mode');
        cutBtn.textContent = 'Cut Mode';
        document.getElementById('cut-tooltip').style.display = 'none';
        window.hoveredConnection = null;
        if (window.updateConnections) window.updateConnections();
    }
}

// Toggle cut mode on button click
cutBtn.onclick = function() {
    setCutMode(!window.cutMode);
};

// Also allow Escape key to exit cut mode
document.addEventListener('keydown', function(e) {
    if (window.cutMode && e.key === 'Escape') {
        setCutMode(false);
    }
});

// Use the existing canvas variable if already declared
var canvas = window.canvas || document.getElementById('connections');
window.canvas = canvas;

canvas.addEventListener('mousemove', function(e) {
    if (!window.cutMode) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    let found = null;
    let minDist = 16; // px threshold

    (window.nodeData || []).forEach(node => {
        const fromEl = document.querySelector(`.card[data-id="${node.id}"] .output-point`);
        if (!fromEl) return;
        (node.outputs || []).forEach(targetId => {
            const toEl = document.querySelector(`.card[data-id="${targetId}"] .input-point`);
            if (!toEl) return;

            const fromRect = fromEl.getBoundingClientRect();
            const toRect = toEl.getBoundingClientRect();
            const canvasRect = canvas.getBoundingClientRect();
            const x1 = fromRect.left + fromRect.width / 2 - canvasRect.left;
            const y1 = fromRect.top + fromRect.height / 2 - canvasRect.top;
            const x2 = toRect.left + toRect.width / 2 - canvasRect.left;
            const y2 = toRect.top + toRect.height / 2 - canvasRect.top;

            // Distance from mouse to Bezier curve (approximate as line)
            const dist = pointToLineDistance(mouseX, mouseY, x1, y1, x2, y2);
            if (dist < minDist) {
                minDist = dist;
                found = { from: node.id, to: targetId };
            }
        });
    });

    window.hoveredConnection = found;
    if (window.updateConnections) window.updateConnections();
});

canvas.addEventListener('click', function(e) {
    if (!window.cutMode || !window.hoveredConnection) return;

    const { from, to } = window.hoveredConnection;
    // Remove the connection from outputs
    const fromNode = window.nodeData.find(n => n.id === from);
    if (fromNode) {
        fromNode.outputs = (fromNode.outputs || []).filter(id => id !== to);
    }
    // Remove the connection from inputs
    const toNode = window.nodeData.find(n => n.id === to);
    if (toNode) {
        toNode.inputs = (toNode.inputs || []).filter(id => id !== from);
    }
    // Save and update
    localStorage.setItem('nodes', JSON.stringify(window.nodeData));
    window.hoveredConnection = null;
    if (window.loadNodes) window.loadNodes();
    if (window.updateConnections) window.updateConnections();
    if (
        typeof window.showInspector === 'function' &&
        window.currentInspectedNodeId &&
        window.nodeData
    ) {
        const node = window.nodeData.find(n => n.id === window.currentInspectedNodeId);
        if (node) window.showInspector(node);
    }
});

// Helper function
function pointToLineDistance(px, py, x1, y1, x2, y2) {
    const A = px - x1, B = py - y1, C = x2 - x1, D = y2 - y1;
    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    let param = -1;
    if (len_sq !== 0) param = dot / len_sq;
    let xx, yy;
    if (param < 0) { xx = x1; yy = y1; }
    else if (param > 1) { xx = x2; yy = y2; }
    else { xx = x1 + param * C; yy = y1 + param * D; }
    const dx = px - xx, dy = py - yy;
    return Math.sqrt(dx * dx + dy * dy);
}

// Track hovered node for cut mode
let lastCutHoverNode = null;

document.getElementById('container').addEventListener('mousemove', function(e) {
    if (!window.cutMode) return;

    // Only trigger if not hovering a connection
    if (window.hoveredConnection) {
        if (lastCutHoverNode) {
            lastCutHoverNode.classList.remove('cut-hover');
            lastCutHoverNode = null;
        }
        return;
    }

    const card = e.target.closest('.card');
    // Remove highlight from previous
    if (lastCutHoverNode && lastCutHoverNode !== card) {
        lastCutHoverNode.classList.remove('cut-hover');
        lastCutHoverNode = null;
    }
    // Highlight new card
    if (card) {
        card.classList.add('cut-hover');
        lastCutHoverNode = card;
    }
});

document.getElementById('container').addEventListener('mouseleave', function() {
    if (lastCutHoverNode) {
        lastCutHoverNode.classList.remove('cut-hover');
        lastCutHoverNode = null;
    }
});

// Remove highlight when exiting cut mode
function removeCutHoverHighlight() {
    if (lastCutHoverNode) {
        lastCutHoverNode.classList.remove('cut-hover');
        lastCutHoverNode = null;
    }
}
const origSetCutMode = setCutMode;
setCutMode = function(active) {
    origSetCutMode(active);
    if (!active) removeCutHoverHighlight();
};

document.getElementById('container').addEventListener('click', function(e) {
    if (!window.cutMode) return;
    // Don't delete if clicking a connection (handled elsewhere)
    if (window.hoveredConnection) return;
    const card = e.target.closest('.card');
    if (card && card.dataset.id) {
        const nodeId = card.dataset.id;
        // Remove the node and its connections
        window.nodeData = window.nodeData.filter(n => n.id !== nodeId);
        window.nodeData.forEach(n => {
            n.inputs = (n.inputs || []).filter(id => id !== nodeId);
            n.outputs = (n.outputs || []).filter(id => id !== nodeId);
        });
        localStorage.setItem('nodes', JSON.stringify(window.nodeData));
        if (window.loadNodes) window.loadNodes();
        if (window.updateConnections) window.updateConnections();
    }
});