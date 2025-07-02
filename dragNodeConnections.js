let isConnecting = false;
let connectFrom = null;
let tempLine = null;

function setupConnectionEvents() {
    const container = document.getElementById('container');
    const outputPoints = document.querySelectorAll('.output-point');
    const inputPoints = document.querySelectorAll('.input-point');

    outputPoints.forEach(output => {
        output.onmousedown = function(e) {
            e.stopPropagation();
            isConnecting = true;
            connectFrom = output.parentElement.dataset.id;
            output.classList.add('active');
            document.body.style.cursor = 'grabbing'; // Always set grabbing on drag start
            tempLine = { from: output, x: e.clientX, y: e.clientY };
            container.addEventListener('mousemove', drawTempLine);
            document.addEventListener('mousemove', drawTempLine);
            document.addEventListener('mouseup', stopTempLine);
        };
        // Highlight on hover if connecting
        output.onmouseenter = function() {
            if (isConnecting) output.classList.add('active');
        };
        output.onmouseleave = function() {
            if (!isConnecting) output.classList.remove('active');
        };
    });

    inputPoints.forEach(input => {
        // Highlight on hover if connecting
        input.onmouseenter = function() {
            if (isConnecting) input.classList.add('active');
        };
        input.onmouseleave = function() {
            if (isConnecting) input.classList.remove('active');
        };
        input.onmouseup = function(e) {
            if (!isConnecting || !connectFrom) return;
            const fromNode = window.nodeData.find(n => n.id === connectFrom);
            const toNode = window.nodeData.find(n => n.id === input.parentElement.dataset.id);
            // Prevent connecting to self and prevent duplicate connections
            if (fromNode && toNode && fromNode.id !== toNode.id) {
                if (!fromNode.outputs.includes(toNode.id)) {
                    fromNode.outputs.push(toNode.id);
                    toNode.inputs = toNode.inputs || [];
                    if (!toNode.inputs.includes(fromNode.id)) {
                        toNode.inputs.push(fromNode.id);
                    }
                    // Save and update
                    const saveObj = {
    metadata: {
        lastScratchProjectId: window.lastScratchProjectId || null
    },
    nodes: window.nodeData
};
localStorage.setItem('nodes', JSON.stringify(saveObj));
                    if (window.updateConnections) window.updateConnections();
                }
                if (
                    typeof window.showInspector === 'function' &&
                    window.currentInspectedNodeId &&
                    window.nodeData
                ) {
                    const node = window.nodeData.find(n => n.id === window.currentInspectedNodeId);
                    if (node) window.showInspector(node);
                }
            }
            // Highlight the selected input point
            input.classList.add('active');
            setTimeout(() => {
                input.classList.remove('active');
            }, 300);

            isConnecting = false;
            connectFrom = null;
            clearTempLine();
            // Remove highlight from all node points (except the just-highlighted input)
            document.querySelectorAll('.node-point.active').forEach(el => {
                if (el !== input) el.classList.remove('active');
            });
        };
    });
}

function drawTempLine(e) {
    if (!isConnecting || !tempLine) return;
    const canvas = document.getElementById('connections');
    const ctx = canvas.getContext('2d');
    window.updateConnections(); // Redraw all lines
    const fromRect = tempLine.from.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    const x1 = fromRect.left + fromRect.width / 2 - canvasRect.left;
    const y1 = fromRect.top + fromRect.height / 2 - canvasRect.top;
    const x2 = e.clientX - canvasRect.left;
    const y2 = e.clientY - canvasRect.top;
    ctx.beginPath();
    ctx.moveTo(x1, y1);

    // Draw a horizontal Bezier curve for the temp line
    const dx = Math.abs(x2 - x1) * 0.5;
    ctx.bezierCurveTo(
        x1 + dx, y1,
        x2 - dx, y2,
        x2, y2
    );

    ctx.strokeStyle = '#ffab19';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
}

function stopTempLine() {
    isConnecting = false;
    connectFrom = null;
    clearTempLine();
    document.body.style.cursor = ''; // Reset cursor on drag end
    document.removeEventListener('mousemove', drawTempLine);
    document.removeEventListener('mouseup', stopTempLine);
    document.querySelectorAll('.node-point.active').forEach(el => el.classList.remove('active'));
}

function clearTempLine() {
    if (window.updateConnections) window.updateConnections();
}

window.setupConnectionEvents = setupConnectionEvents;