window.inspectorToolPanels['tool:notepad'] = function(node, panelEl) {
    const content = node.data?.notepadContent || '';
    panelEl.innerHTML = `
        <div>
            <p>Notepad contents:</p>
            <input type="text" 
                   value="${content ? content.replace(/"/g, '&quot;') : '(empty)'}" 
                   readonly 
                   style="width: 90%; color: #aaa; background: #18192a; border: 1px solid #444; border-radius: 6px; padding: 4px;">
        </div>
    `;
};