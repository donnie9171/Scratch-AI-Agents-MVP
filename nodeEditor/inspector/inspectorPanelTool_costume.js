window.inspectorToolPanels['tool:costume'] = function(node, panelEl) {
    panelEl.innerHTML = `
        <div>
            <p>Target sprite:</p>
            <input type="text" id="costume-sprite-input" value="${node.data?.spriteName || ''}" style="margin-bottom: 12px;">
            <div style="margin-top: 12px;">
                <span class="variable-badge ${isCostumeToolSet(node) ? 'on' : 'off'}">
                    ${isCostumeToolSet(node) ? 'Set' : 'Set (not connected)'}
                </span>
                <span class="variable-badge ${isCostumeToolGet(node) ? 'on' : 'off'}" style="margin-left:16px;">
                    ${isCostumeToolGet(node) ? 'Get' : 'Get (not connected)'}
                </span>
            </div>
        </div>
    `;
    panelEl.querySelector('#costume-sprite-input').addEventListener('input', function(e) {
        node.data.spriteName = e.target.value;
        const saveObj = {
    metadata: {
        lastScratchProjectId: window.lastScratchProjectId || null
    },
    nodes: window.nodeData
};
localStorage.setItem('nodes', JSON.stringify(saveObj));
    });
};

function isCostumeToolGet(node) {
    return Array.isArray(node.outputs) && node.outputs.length > 0;
}
function isCostumeToolSet(node) {
    return Array.isArray(node.inputs) && node.inputs.length > 0;
}