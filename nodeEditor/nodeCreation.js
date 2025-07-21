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

// document.getElementById('new-costume-tool').onclick = function() {
//     addNewNode('tool', 'costume');
// };

// Add handler for new comment button
document.getElementById('new-comment').onclick = function() {
    addNewNode('comment');
};

// Update addNewNode to handle 'comment' type
function addNewNode(type, subtype) {
    if (!window.nodeData) return;
    const id = `${type}${Date.now()}`;
    const position = { top: 100 + Math.random() * 100, left: 100 + Math.random() * 100 };
    let node = {
        id,
        type,
        toolType: subtype || null,
        inputs: [],
        outputs: [],
        data: { 
            label: subtype 
                ? (subtype.charAt(0).toUpperCase() + subtype.slice(1) + ' Tool') 
                : (type.charAt(0).toUpperCase() + type.slice(1)),
            ...(type === 'agent' ? { model: 'gpt-3.5-turbo' } : {})
        },
        position
    };
    if (type === 'receiver') {
        node.outputs = [];
    } else if (type === 'broadcaster') {
        node.inputs = [];
    } else if (type === 'comment') {
        node.data.markdown = ''; // Initialize markdown field for comment nodes
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