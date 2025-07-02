document.getElementById('load-nodes').onclick = function() {
    localStorage.removeItem('nodes');
    window.loadNodes();
};

document.getElementById('save-nodes').onclick = function() {
    if (window.nodeData) {
        const saveObj = {
            metadata: {
                lastScratchProjectId: window.lastScratchProjectId || null
            },
            nodes: window.nodeData
        };
        const dataStr = JSON.stringify(saveObj, null, 2);
        document.getElementById('json-modal-text').value = dataStr;
        document.getElementById('json-modal').style.display = 'flex';
    }
};

document.getElementById('close-json-modal').onclick = function() {
    document.getElementById('json-modal').style.display = 'none';
};

document.getElementById('copy-json-modal').onclick = function() {
    const textarea = document.getElementById('json-modal-text');
    textarea.select();
    textarea.setSelectionRange(0, 99999); // For mobile devices
    document.execCommand('copy');
};