// document.getElementById('load-nodes').onclick = function() {
//     localStorage.removeItem('nodes');
//     window.loadNodes();
// };

document.getElementById('save-nodes').onclick = function() {
    if (window.nodeData) {
        // Get selectedNode and projectName from localStorage if present
        let selectedNode = null;
        let projectName = '';
        try {
            const saveObj = JSON.parse(localStorage.getItem('nodes'));
            selectedNode = saveObj?.metadata?.selectedNode || null;
            projectName = saveObj?.metadata?.projectName || '';
        } catch (e) {}
        // If no projectName, use default
        if (!projectName) projectName = 'Untitled MEW Project';
        // Set the project name field in the modal
        const projectNameInput = document.getElementById('json-modal-project-name');
        if (projectNameInput) projectNameInput.value = projectName;
        const saveObj = {
            metadata: {
                lastScratchProjectId: window.lastScratchProjectId || null,
                selectedNode: selectedNode,
                projectName: projectName
            },
            nodes: window.nodeData
        };
        const dataStr = JSON.stringify(saveObj, null, 2);
        document.getElementById('json-modal-text').value = dataStr;
        document.getElementById('json-modal').style.display = 'flex';

        // --- Real-time sync project name to JSON ---
        if (projectNameInput) {
            projectNameInput.oninput = function() {
                // Update projectName in localStorage and refresh textarea from localStorage
                try {
                    let saveObj = JSON.parse(localStorage.getItem('nodes'));
                    if (!saveObj) return;
                    saveObj.metadata = saveObj.metadata || {};
                    saveObj.metadata.projectName = projectNameInput.value;
                    localStorage.setItem('nodes', JSON.stringify(saveObj));
                    // Update textarea to reflect latest localStorage
                    document.getElementById('json-modal-text').value = JSON.stringify(saveObj, null, 2);
                } catch (e) {
                    // If localStorage is invalid, do nothing
                }
            };
        }
        // --- End real-time sync ---
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

document.getElementById('download-json-modal').onclick = function() {
    const textarea = document.getElementById('json-modal-text');
    const projectNameInput = document.getElementById('json-modal-project-name');
    let projectName = (projectNameInput && projectNameInput.value.trim()) ? projectNameInput.value.trim() : 'Untitled MEW Project';
    // Update projectName in the JSON before download
    let saveObj = {};
    try {
        saveObj = JSON.parse(textarea.value);
    } catch (e) {
        saveObj = {};
    }
    if (!saveObj.metadata) saveObj.metadata = {};
    saveObj.metadata.projectName = projectName;
    const dataStr = JSON.stringify(saveObj, null, 2);
    textarea.value = dataStr;
    // Sanitize filename: remove illegal characters
    let filename = projectName.replace(/[^a-zA-Z0-9-_ ]/g, '').replace(/\s+/g, '_');
    if (!filename) filename = 'MEW_Project';
    filename += '.json';
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
};