window.inspectorToolPanels['agent'] = function(node, panelEl) {
    // Ensure model field exists and defaults to gpt-3.5-turbo
    if (!node.data) node.data = {};
    if (!node.data.model) node.data.model = 'gpt-3.5-turbo';

    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    let modelOptions = '';
    if (isLocalhost) {
        modelOptions += '<option value="llama-3.2">llama 3.2</option>';
    }
    modelOptions += '<option value="gpt-3.5-turbo">gpt 3.5 turbo</option>';

    const nodeState = window.runtimeState.getNodeState(window.currentInspectedNodeId);
    const errorMsg = nodeState && nodeState.error !== undefined ? nodeState.error : null;
    panelEl.innerHTML = `
        <div>
            <div id="agent-error-modal" style="${errorMsg ? 'display:block;' : 'display:none;'} background:rgba(255,90,90,0.18); color:#fff; padding:10px; border-radius:10px; font-size:16px; z-index:4000; box-shadow:0 2px 8px rgba(0,0,0,0.18); text-align:left; pointer-events:none; margin-bottom:10px; border-left:5px solid #ff5a5a;">
                <span id="agent-error-badge" style="font-weight:600; vertical-align:middle; display:inline-block; width:22px; height:22px; margin-right:0px; margin-top: 1px; margin-left: 5px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-octagon-x-icon lucide-octagon-x"><path d="m15 9-6 6"/><path d="M2.586 16.726A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2h6.624a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586z"/><path d="m9 9 6 6"/></svg>
                </span>
                <span id="agent-error-message" style="margin-left:5px; margin-top: 3px;">${errorMsg ? errorMsg : 'oops something went horribly wrong :('}</span>
            </div>

            <label for="agent-model">Model:</label>
            <select id="agent-model">${modelOptions}</select>
            <p>Prompt:</p>
            <pre id="agent-prompt">${nodeState && nodeState.prompt ? nodeState.prompt : 'No prompt set'}</pre>
            <p>Inference:</p>
            <pre id="agent-inference">${nodeState && nodeState.inference ? nodeState.inference : 'No inference yet'}</pre>
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