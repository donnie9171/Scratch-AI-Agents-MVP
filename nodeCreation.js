document.getElementById('new-agent').onclick = function() {
    addNewNode('agent');
};

document.getElementById('new-tool').onclick = function() {
    addNewNode('tool');
};

document.getElementById('new-receiver').onclick = function() {
    addNewNode('receiver');
};
document.getElementById('new-broadcaster').onclick = function() {
    addNewNode('broadcaster');
};

function addNewNode(type) {
    if (!window.nodeData) return;
    // Generate a unique id
    const id = `${type}${Date.now()}`;
    const position = { top: 100 + Math.random() * 100, left: 100 + Math.random() * 100 };
    let node = {
        id,
        type,
        inputs: [],
        outputs: [],
        data: { label: type.charAt(0).toUpperCase() + type.slice(1) },
        position
    };
    if (type === 'receiver') {
        node.outputs = [];
    } else if (type === 'broadcaster') {
        node.inputs = [];
    }
    window.nodeData.push(node);
    localStorage.setItem('nodes', JSON.stringify(window.nodeData));
    if (window.loadNodes) window.loadNodes();
}