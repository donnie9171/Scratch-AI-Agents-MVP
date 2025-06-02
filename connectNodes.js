const canvas = document.getElementById('connections');
const ctx = canvas.getContext('2d');

// Resize canvas to match container
function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Draw a line between two nodes
function drawConnection(node1, node2) {
    const rect1 = node1.getBoundingClientRect();
    const rect2 = node2.getBoundingClientRect();

    const x1 = rect1.left + rect1.width / 2;
    const y1 = rect1.top + rect1.height / 2;
    const x2 = rect2.left + rect2.width / 2;
    const y2 = rect2.top + rect2.height / 2;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();
}

// Update connections dynamically
function updateConnections() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Example: Connect the first two cards
    if (cards.length >= 3) {
        drawConnection(cards[0], cards[1]);
        drawConnection(cards[0], cards[2]);
    }
}

// Update connections when nodes are moved
Array.from(cards).forEach(card => {
    card.addEventListener('mousedown', () => {
        document.addEventListener('mousemove', updateConnections);
        document.addEventListener('mouseup', () => {
            document.removeEventListener('mousemove', updateConnections);
        });
    });
});

// Initial connection rendering
updateConnections();