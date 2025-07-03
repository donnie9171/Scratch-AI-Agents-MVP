window.inspectorToolPanels['agent'] = function(node, panelEl) {

    panelEl.innerHTML = `
        <div>
            <p>Prompt:</p>
            <pre id="agent-prompt">${window.runtimeState.getNodeState(window.currentInspectedNodeId).prompt? window.runtimeState.getNodeState(window.currentInspectedNodeId).prompt: 'No prompt set'}</pre>
            <p>Inference:</p>
            <pre id="agent-inference">${window.runtimeState.getNodeState(window.currentInspectedNodeId).inference? window.runtimeState.getNodeState(window.currentInspectedNodeId).inference: 'No inference yet'}</pre>
        </div>
    `;

};