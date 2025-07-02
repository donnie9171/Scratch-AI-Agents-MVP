window.inspectorToolPanels['tool:notepad'] = function(node, panelEl) {
    const content = node.data?.notepadContent || '';
    const isEditable = !Array.isArray(node.inputs) || node.inputs.length === 0;

    panelEl.innerHTML = `
        <div>
            <p>Notepad contents:</p>
            <input type="text" 
                   id="notepad-content-input"
                   value="${content ? content.replace(/"/g, '&quot;') : ''}" 
                   ${isEditable ? '' : 'readonly'}
                   placeholder="(empty)"
                   style="width: 90%; color: #aaa; background: #18192a; border: 1px solid #444; border-radius: 6px; padding: 4px;">
            ${!isEditable ? '<div style="color:#ff8c17; margin-top:6px;">Contents not editable: input is connected so this node will be getting value from input.</div>' : ''}
        </div>
    `;

    if (isEditable) {
        panelEl.querySelector('#notepad-content-input').addEventListener('input', function(e) {
            node.data.notepadContent = e.target.value;
            const saveObj = {
                metadata: {
                    lastScratchProjectId: window.lastScratchProjectId || null
                },
                nodes: window.nodeData
            };
            localStorage.setItem('nodes', JSON.stringify(saveObj));
        });
    }
};