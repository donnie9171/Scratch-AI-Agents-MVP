window.inspectorToolPanels['agent'] = function(node, panelEl) {
    // Ensure model field exists and defaults to llama-3.2
    if (!node.data) node.data = {};
    if (!node.data.model) node.data.model = 'llama-3.2';

    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    let modelOptions = '';
    if (isLocalhost) {
        modelOptions += '<option value="llama-3.2">llama 3.2</option>';
    }
    modelOptions += '<option value="gpt-3.5-turbo">gpt 3.5 turbo</option>';

    panelEl.innerHTML = `
        <div>
            <label for="agent-model">Model:</label>
            <select id="agent-model">${modelOptions}</select>
            <p>Prompt:</p>
            <pre id="agent-prompt">${window.runtimeState.getNodeState(window.currentInspectedNodeId).prompt ? window.runtimeState.getNodeState(window.currentInspectedNodeId).prompt : 'No prompt set'}</pre>
            <p>Inference:</p>
            <pre id="agent-inference">${window.runtimeState.getNodeState(window.currentInspectedNodeId).inference ? window.runtimeState.getNodeState(window.currentInspectedNodeId).inference : 'No inference yet'}</pre>
        </div>
    `;

    // Set dropdown to current value
    const modelSelect = panelEl.querySelector('#agent-model');
    modelSelect.value = node.data.model || 'gpt-3.5-turbo';
    modelSelect.addEventListener('change', function(e) {
        node.data.model = e.target.value;
        // Save to localStorage
        const saveObj = {
            metadata: {
                lastScratchProjectId: window.lastScratchProjectId || null,
            },
            nodes: window.nodeData,
        };
        localStorage.setItem('nodes', JSON.stringify(saveObj));
    });
};