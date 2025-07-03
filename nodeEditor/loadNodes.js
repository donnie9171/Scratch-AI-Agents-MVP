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
        window.nodeData.forEach(node => {
        if (node.type === "receiver") {
            setupReceiverNode(node);
        }
        });
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
            window.nodeData.forEach(node => {
            if (node.type === "receiver") {
                setupReceiverNode(node);
            }
            });
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
}

// Add this function somewhere accessible (e.g., in loadNodes.js or a shared utils file)
window.updateNodeRunStatusBadge = function(node) {
    const el = document.querySelector(`.card[data-id="${node.id}"]`);
    if (!el) return;
    let badge = el.querySelector('.run-status-badge');
    if (!badge) {
        badge = document.createElement('div');
        badge.className = 'run-status-badge';
        el.appendChild(badge);
    }

    let status = null;
    let badgeIcon = '';
    let badgeBg = '';
    let badgeDisplay = 'none';

    if (window.runtimeState && typeof window.runtimeState.getNodeState === 'function') {
        status = window.runtimeState.getNodeState(node.id).runStatus || null;
    }

    if (status === 'queued') {
        badgeIcon = `
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-hourglass-icon lucide-hourglass"><path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></svg>`;
        badgeBg = '#999999';
        badgeDisplay = 'flex';
    } else if (status === 'running') {
        badgeIcon = `
<svg class="spin" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-refresh-cw-icon lucide-refresh-cw"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>`;
        badgeBg = '#5269ff';
        badgeDisplay = 'flex';
    } else if (status === 'error') {
        badgeIcon = `
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-octagon-x-icon lucide-octagon-x"><path d="m15 9-6 6"/><path d="M2.586 16.726A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2h6.624a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586z"/><path d="m9 9 6 6"/></svg>`;
        badgeBg = '#ff5a5a';
        badgeDisplay = 'flex';
    } else if (status === 'complete') {
        badgeIcon = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="margin-top:2px;" class="lucide lucide-check-icon lucide-check"><path d="M20 6 9 17l-5-5"/></svg>`;
        badgeBg = '#5ac05b';
        badgeDisplay = 'flex';
    }
    badge.style.display = badgeDisplay;
    badge.style.background = badgeBg;
    badge.innerHTML = badgeIcon;
};