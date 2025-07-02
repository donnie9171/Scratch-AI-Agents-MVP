document.getElementById('new-agent').onclick = function() {
    addNewNode('agent');
};

document.getElementById('new-receiver').onclick = function() {
    addNewNode('receiver');
};
document.getElementById('new-broadcaster').onclick = function() {
    addNewNode('broadcaster');
};
// Add these button handlers
document.getElementById('new-variable-tool').onclick = function() {
    addNewNode('tool', 'variable');
};
document.getElementById('new-notepad-tool').onclick = function() {
    addNewNode('tool', 'notepad');
};

document.getElementById('new-costume-tool').onclick = function() {
    addNewNode('tool', 'costume');
};

// Update addNewNode to accept a subtype
function addNewNode(type, subtype) {
    if (!window.nodeData) return;
    const id = `${type}${Date.now()}`;
    const position = { top: 100 + Math.random() * 100, left: 100 + Math.random() * 100 };
    let node = {
        id,
        type,
        toolType: subtype || null, // <-- add this field
        inputs: [],
        outputs: [],
        data: { 
            label: subtype 
                ? (subtype.charAt(0).toUpperCase() + subtype.slice(1) + ' Tool') 
                : (type.charAt(0).toUpperCase() + type.slice(1))
        },
        position
    };
    if (type === 'receiver') {
        node.outputs = [];
    } else if (type === 'broadcaster') {
        node.inputs = [];
    }
    window.nodeData.push(node);
    const saveObj = {
    metadata: {
        lastScratchProjectId: window.lastScratchProjectId || null
    },
    nodes: window.nodeData
};
localStorage.setItem('nodes', JSON.stringify(saveObj));
    if (window.loadNodes) window.loadNodes();
}