window.initDragAndDrop = function() {
    let newX = 0, newY = 0, startX = 0, startY = 0;
    const cards = document.getElementsByClassName('card');
    Array.from(cards).forEach(card => {
        card.onmousedown = function mouseDown(e) {
            startX = e.clientX;
            startY = e.clientY;
            document.onmousemove = function mouseMove(e) {
                newX = startX - e.clientX;
                newY = startY - e.clientY;
                startX = e.clientX;
                startY = e.clientY;
                card.style.top = (card.offsetTop - newY) + 'px';
                card.style.left = (card.offsetLeft - newX) + 'px';
                // Update position in nodeData if available
                if (window.nodeData) {
                    const nodeId = card.dataset.id;
                    const node = window.nodeData.find(n => n.id === nodeId);
                    if (node) {
                        node.position = {
                            top: parseInt(card.style.top, 10),
                            left: parseInt(card.style.left, 10)
                        };
                        // Save updated nodes to localStorage
                        const saveObj = {
    metadata: {
        lastScratchProjectId: window.lastScratchProjectId || null
    },
    nodes: window.nodeData
};
localStorage.setItem('nodes', JSON.stringify(saveObj));
                    }
                }
                if (window.updateConnections) window.updateConnections();
            };
            document.onmouseup = function mouseUp() {
                document.onmousemove = null;
                document.onmouseup = null;
            };
        };
    });
};
window.initDragAndDrop();