window.loadNodes = function() {
    let saveObj;
    const saved = localStorage.getItem('nodes');
    if (saved) {
        try {
            saveObj = JSON.parse(saved);
        } catch (e) {
            saveObj = null;
        }
    }
    if (saveObj && saveObj.nodes) {
        window.lastScratchProjectId = saveObj.metadata?.lastScratchProjectId || null;
        renderNodes(saveObj.nodes);
        window.nodeData = saveObj.nodes;
        // Reload the iframe with the project ID from save data
        if (window.lastScratchProjectId) {
            if (typeof window.reloadScratchIframe === 'function') {
                window.reloadScratchIframe(window.lastScratchProjectId);
            }
            // Also update the input field if present
            const input = document.getElementById('scratch-project-id');
            if (input) input.value = window.lastScratchProjectId;
        }
    } else {
        fetch('data.json')
        .then(res => res.json())
        .then(saveObj => {
            window.lastScratchProjectId = saveObj.metadata?.lastScratchProjectId || null;
            renderNodes(saveObj.nodes);
            window.nodeData = saveObj.nodes;
            // Save initial data to localStorage
            localStorage.setItem('nodes', JSON.stringify(saveObj));
            // Reload the iframe with the project ID from save data
            if (window.lastScratchProjectId) {
                if (typeof window.reloadScratchIframe === 'function') {
                    window.reloadScratchIframe(window.lastScratchProjectId);
                }
                const input = document.getElementById('scratch-project-id');
                if (input) input.value = window.lastScratchProjectId;
            }
        });
    }
};

function renderNodes(nodes) {
    const container = document.getElementById('container');
    Array.from(document.getElementsByClassName('card')).forEach(el => el.remove());
    nodes.forEach(node => {
        const div = document.createElement('div');
        div.className = `card ${node.type}`;
        div.dataset.id = node.id;
        
        let icon = '';
        let toolColor = '';
        if (node.type === 'agent') icon = '🤖';
        else if (node.type === 'tool') {
            if (node.toolType === 'variable') {
                icon = '🔢';
                toolColor = '#ff8c17';
            } else if (node.toolType === 'notepad') {
                icon = '📝';
                toolColor = '#5ac05b';
            } else if (node.toolType === 'costume') {
                icon = '🎭';
                toolColor = '#9965ff';
            } else {
                icon = '🛠️';
                toolColor = '#5abd13';
            }
        }
        else if (node.type === 'receiver') icon = '📥';
        else if (node.type === 'broadcaster') icon = '📢';
        else icon = '🔹';

        // Use custom icon if provided
        if (node.data && node.data.icon) {
            icon = node.data.icon;
        }

        div.innerHTML = `
            <!-- <span class="node-icon">${icon}</span> -->
            <span class="node-label">${node.data.label || node.id}</span>
        `;

        // Set tool color if applicable
        if (node.type === 'tool' && toolColor) {
            div.style.backgroundColor = toolColor;
            div.style.borderRadius = '10px';
        }

        if (node.type === 'tool' && node.toolType) {
            div.setAttribute('data-tool-type', node.toolType);
        }

        // Add connection points (existing logic)
        if (node.type === 'receiver') {
            const outputPoint = document.createElement('div');
            outputPoint.className = 'node-point output-point';
            outputPoint.title = 'Output';
            div.appendChild(outputPoint);
        } else if (node.type === 'broadcaster') {
            const inputPoint = document.createElement('div');
            inputPoint.className = 'node-point input-point';
            inputPoint.title = 'Input';
            div.appendChild(inputPoint);
        } else {
            const inputPoint = document.createElement('div');
            inputPoint.className = 'node-point input-point';
            inputPoint.title = 'Input';
            div.appendChild(inputPoint);

            const outputPoint = document.createElement('div');
            outputPoint.className = 'node-point output-point';
            outputPoint.title = 'Output';
            div.appendChild(outputPoint);
        }

        if (node.position && typeof node.position.top === 'number' && typeof node.position.left === 'number') {
            div.style.top = `${node.position.top}px`;
            div.style.left = `${node.position.left}px`;
        } else {
            div.style.top = `${100 + Math.random() * 300}px`;
            div.style.left = `${100 + Math.random() * 500}px`;
        }
        container.appendChild(div);
    });
    if (window.initDragAndDrop) window.initDragAndDrop();
    if (window.initConnections) window.initConnections(nodes);
    if (window.setupConnectionEvents) window.setupConnectionEvents();
    if (window.runAllNodes) window.runAllNodes();
}

