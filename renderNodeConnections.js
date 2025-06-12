const canvas = document.getElementById('connections');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    if (window.updateConnections) window.updateConnections(); // Redraw lines after resize
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

            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.stroke();
        });
    });
};