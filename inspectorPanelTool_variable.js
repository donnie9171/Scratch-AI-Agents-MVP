window.inspectorToolPanels['tool:variable'] = function(node, panelEl) {
    const getChecked = isVariableToolGet(node) ? 'checked' : '';
    const setChecked = isVariableToolSet(node) ? 'checked' : '';
    const getLabel = isVariableToolGet(node) ? 'Get' : 'Get (not connected)';
    const setLabel = isVariableToolSet(node) ? 'Set' : 'Set (not connected)';
    panelEl.innerHTML = `
        <div>
            <p>Target variable:</p>
            <input type="text" id="variable-name-input" value="${node.data?.variableName || ''}" style="margin-bottom: 12px;">
            <div>
                <span class="variable-badge ${isVariableToolSet(node) ? 'on' : 'off'}">
                    ${isVariableToolSet(node) ? 'Set' : 'Set (not connected)'}
                </span>
                <span class="variable-badge ${isVariableToolGet(node) ? 'on' : 'off'}" style="margin-left:16px;">
                    ${isVariableToolGet(node) ? 'Get' : 'Get (not connected)'}
                </span>
            </div>
        </div>
    `;
    panelEl.querySelector('#variable-name-input').addEventListener('input', function(e) {
        node.data.variableName = e.target.value;
        localStorage.setItem('nodes', JSON.stringify(window.nodeData));
    });
};

function isVariableToolGet(node) {
    return Array.isArray(node.outputs) && node.outputs.length > 0;
}
function isVariableToolSet(node) {
    return Array.isArray(node.inputs) && node.inputs.length > 0;
}

window.showInspector = showInspector;