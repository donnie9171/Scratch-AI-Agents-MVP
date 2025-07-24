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

            // Bezier control points
            const cp1x = x1 + dx;
            const cp1y = y1;
            const cp2x = x2 - dx;
            const cp2y = y2;
            // Position and derivative functions
            function cubicBezier(t, p0, p1, p2, p3) {
                const mt = 1 - t;
                return mt * mt * mt * p0 + 3 * mt * mt * t * p1 + 3 * mt * t * t * p2 + t * t * t * p3;
            }
            function cubicBezierDerivative(t, p0, p1, p2, p3) {
                const mt = 1 - t;
                return 3 * mt * mt * (p1 - p0) + 6 * mt * t * (p2 - p1) + 3 * t * t * (p3 - p2);
            }
            // Approximate curve length by sampling
            let prevX = x1, prevY = y1, curveLen = 0;
            const steps = 50;
            const points = [{x: x1, y: y1, t: 0}];
            for (let i = 1; i <= steps; i++) {
                const t = i / steps;
                const px = cubicBezier(t, x1, cp1x, cp2x, x2);
                const py = cubicBezier(t, y1, cp1y, cp2y, y2);
                curveLen += Math.hypot(px - prevX, py - prevY);
                points.push({x: px, y: py, t});
                prevX = px; prevY = py;
            }
            // Center triangle at midpoint
            const baseDist = 20; // distance from tip to base center
            const baseWidth = 12; // width of base
            // Find t for tip: t = midpoint + baseDist/(2*curveLen)
            let midIdx = Math.floor(points.length / 2);
            let midT = points[midIdx].t;
            let tipT = midT;
            let dist = 0;
            for (let i = midIdx; i < points.length - 1; i++) {
                const segLen = Math.hypot(points[i+1].x - points[i].x, points[i+1].y - points[i].y);
                dist += segLen;
                if (dist >= baseDist/2) {
                    tipT = points[i+1].t;
                    break;
                }
            }
            const tipX = cubicBezier(tipT, x1, cp1x, cp2x, x2);
            const tipY = cubicBezier(tipT, y1, cp1y, cp2y, y2);
            const dxTangent = cubicBezierDerivative(tipT, x1, cp1x, cp2x, x2);
            const dyTangent = cubicBezierDerivative(tipT, y1, cp1y, cp2y, y2);
            const angle = Math.atan2(dyTangent, dxTangent);
            // Base center at midpoint
            const baseCenterX = cubicBezier(midT, x1, cp1x, cp2x, x2);
            const baseCenterY = cubicBezier(midT, y1, cp1y, cp2y, y2);
            // Perpendicular angle
            const perpAngle = angle + Math.PI / 2;
            // Left and right base points
            const leftX = baseCenterX + (baseWidth / 2) * Math.cos(perpAngle);
            const leftY = baseCenterY + (baseWidth / 2) * Math.sin(perpAngle);
            const rightX = baseCenterX - (baseWidth / 2) * Math.cos(perpAngle);
            const rightY = baseCenterY - (baseWidth / 2) * Math.sin(perpAngle);

            ctx.beginPath();
            ctx.moveTo(tipX, tipY);
            ctx.lineTo(leftX, leftY);
            ctx.lineTo(rightX, rightY);
            ctx.closePath();
            ctx.fillStyle = isHovered ? '#ff5a5a' : 'white';
            ctx.fill();
        });
    });
    if (window.currentInspectedNodeId && window.nodeData) {
        const node = window.nodeData.find(n => n.id === window.currentInspectedNodeId);
        if (node && typeof window.showInspector === 'function') {
            window.showInspector(node);
        }
    }
};