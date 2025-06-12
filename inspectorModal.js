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

function showInspector(node) {
    // Remove previous selection
    document.querySelectorAll('.card.selected').forEach(el => el.classList.remove('selected'));
    currentInspectedNodeId = node.id;
    // Highlight the selected node
    const card = document.querySelector(`.card[data-id="${node.id}"]`);
    if (card) card.classList.add('selected');

    document.getElementById('inspector-title').textContent = node.data?.label || node.id;
    document.getElementById('inspector-details').innerHTML = `
        <pre>${JSON.stringify(node, null, 2)}</pre>
    `;
    document.getElementById('inspector-modal').classList.add('active');
    document.body.classList.add('inspector-open');
}

document.getElementById('close-inspector').onclick = function() {
    document.getElementById('inspector-modal').classList.remove('active');
    document.body.classList.remove('inspector-open');
    // Remove selection highlight from any node
    document.querySelectorAll('.card.selected').forEach(el => el.classList.remove('selected'));
    currentInspectedNodeId = null;
};

document.getElementById('delete-inspector').onclick = function() {
    if (!currentInspectedNodeId || !window.nodeData) return;
    // Remove the node
    window.nodeData = window.nodeData.filter(n => n.id !== currentInspectedNodeId);
    // Remove connections to/from this node
    window.nodeData.forEach(n => {
        n.inputs = (n.inputs || []).filter(id => id !== currentInspectedNodeId);
        n.outputs = (n.outputs || []).filter(id => id !== currentInspectedNodeId);
    });
    localStorage.setItem('nodes', JSON.stringify(window.nodeData));
    if (window.loadNodes) window.loadNodes();
    document.getElementById('inspector-modal').classList.remove('active');
    document.body.classList.remove('inspector-open');
    // Remove selection highlight
    document.querySelectorAll('.card.selected').forEach(el => el.classList.remove('selected'));
    currentInspectedNodeId = null;
};