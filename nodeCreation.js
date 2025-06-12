document.getElementById('new-agent').onclick = function() {
    addNewNode('agent');
};

document.getElementById('new-tool').onclick = function() {
    addNewNode('tool');
};

function addNewNode(type) {
    if (!window.nodeData) return;
    // Generate a unique id
    const id = `${type}${Date.now()}`;
    // Place new node near the top left, offset if needed
    const position = { top: 100 + Math.random() * 100, left: 100 + Math.random() * 100 };
    const node = {
        id,
        type,
        inputs: [],
        outputs: [],
        data: { label: type === 'agent' ? `Agent` : `Tool` },
        position
    };
    window.nodeData.push(node);
    localStorage.setItem('nodes', JSON.stringify(window.nodeData));
    if (window.loadNodes) window.loadNodes();
}