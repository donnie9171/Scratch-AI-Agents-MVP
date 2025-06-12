// Use the existing canvas variable if already declared
var canvas = window.canvas || document.getElementById('connections');
window.canvas = canvas;
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    const container = document.getElementById('container');
    const canvas = document.getElementById('connections');
    canvas.width = container.scrollWidth;
    canvas.height = container.scrollHeight;
    if (window.updateConnections) window.updateConnections();
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let nodeData = [];
let nodeElements = {};

window.initConnections = function(nodes) {
    nodeData = nodes;
    window.nodeData = nodeData; // Expose globally for dragAndDrop.js
    nodeElements = {};
    // Map node id to DOM element
    nodes.forEach(node => {
        nodeElements[node.id] = document.querySelector(`.card[data-id="${node.id}"]`);
    });
    window.updateConnections();
};

window.updateConnections = function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    nodeData.forEach(node => {
        const fromEl = nodeElements[node.id];
        if (!fromEl) return;
        const fromOutput = fromEl.querySelector('.output-point');
        node.outputs.forEach(targetId => {
            const toEl = nodeElements[targetId];
            if (!toEl) return;
            const toInput = toEl.querySelector('.input-point');
            // Get positions relative to canvas
            const fromRect = fromOutput.getBoundingClientRect();
            const toRect = toInput.getBoundingClientRect();
            const canvasRect = canvas.getBoundingClientRect();
            const x1 = fromRect.left + fromRect.width / 2 - canvasRect.left;
            const y1 = fromRect.top + fromRect.height / 2 - canvasRect.top;
            const x2 = toRect.left + toRect.width / 2 - canvasRect.left;
            const y2 = toRect.top + toRect.height / 2 - canvasRect.top;

            ctx.beginPath();
            ctx.moveTo(x1, y1);

            // Calculate control points for a horizontal curve
            const dx = Math.abs(x2 - x1) * 0.5;
            ctx.bezierCurveTo(
                x1 + dx, y1,
                x2 - dx, y2,
                x2, y2
            );

            // --- CUT MODE HIGHLIGHT ---
            let isHovered = false;
            if (window.cutMode && window.hoveredConnection) {
                isHovered =
                    window.hoveredConnection.from === node.id &&
                    window.hoveredConnection.to === targetId;
            }
            if (isHovered) {
                ctx.strokeStyle = '#ff5a5a';
                ctx.setLineDash([6, 6]);
                ctx.lineWidth = 3;
            } else {
                ctx.strokeStyle = 'white';
                ctx.setLineDash([]);
                ctx.lineWidth = 2;
            }
            ctx.stroke();
            ctx.setLineDash([]);
        });
    });
};