window.inspectorToolPanels['tool:variable'] = function(node, panelEl) {
    // Render panel immediately with placeholder dropdown, then update when VM is ready
    const content = window.getScratchVariableValue(node.data?.variableName);
    panelEl.innerHTML = `
        <div>
            <p>Target variable:</p>
            <select id="variable-name-select" style="margin-bottom: 12px;" disabled>
                <option>Waiting for VM to load...</option>
            </select>
            <div>
                <span class="variable-badge ${isVariableToolSet(node) ? 'on' : 'off'}">
                    ${isVariableToolSet(node) ? 'Set' : 'Set (not connected)'}
                </span>
                <span class="variable-badge ${isVariableToolGet(node) ? 'on' : 'off'}" style="margin-left:16px;">
                    ${isVariableToolGet(node) ? 'Get' : 'Get (not connected)'}
                </span>
            </div>
            <div margin-top: 12px;">
                <p>Variable contents:</p>
                <input type="text" 
                   value="${content !== '' ? String(content).replace(/"/g, '&quot;') : '(empty)'}"
                   readonly 
                   style="width: 90%; color: #aaa; background: #18192a; border: 1px solid #444; border-radius: 6px; padding: 4px;">
            </div>
        </div>
    `;

    function updateDropdown(variableNames) {
        const select = panelEl.querySelector('#variable-name-select');
        if (!select) return;
        select.innerHTML = variableNames.length === 0
            ? `<option>(no variables found)</option>`
            : variableNames.map(name => `<option value="${name}" ${node.data?.variableName === name ? 'selected' : ''}>${name}</option>`).join('');
        select.disabled = false;
        select.addEventListener('change', function(e) {
            node.data.variableName = e.target.value;
            const saveObj = {
                metadata: {
                    lastScratchProjectId: window.lastScratchProjectId || null
                },
                nodes: window.nodeData
            };
            localStorage.setItem('nodes', JSON.stringify(saveObj));
        });
    }

    function waitForVMAndUpdate(attempts = 0) {
        if (typeof window.checkVMReady === 'function' && window.checkVMReady()) {
            let variableNames = [];
            if (typeof window.getScratchVariableNames === 'function') {
                variableNames = window.getScratchVariableNames();
            }
            updateDropdown(variableNames);
        } else if (attempts < 30) {
            setTimeout(() => waitForVMAndUpdate(attempts + 1), 100);
        } else {
            updateDropdown([]);
        }
    }
    waitForVMAndUpdate();
};

function isVariableToolGet(node) {
    return Array.isArray(node.outputs) && node.outputs.length > 0;
}
function isVariableToolSet(node) {
    return Array.isArray(node.inputs) && node.inputs.length > 0;
}

window.showInspector = showInspector;