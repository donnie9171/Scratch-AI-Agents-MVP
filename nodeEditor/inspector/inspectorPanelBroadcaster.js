window.inspectorToolPanels["broadcaster"] = function (node, panelEl) {
    // Render panel immediately with placeholder dropdown, then update when VM is ready
    panelEl.innerHTML = `
        <div>
            <p>Broadcast Message:</p>
            <select id="broadcast-message-select" style="margin-bottom: 12px;" disabled>
                <option>Waiting for VM to load...</option>
            </select>
        </div>
    `;

    function updateDropdown(broadcastNames) {
        const select = panelEl.querySelector('#broadcast-message-select');
        if (!select) return;
        select.innerHTML = broadcastNames.length === 0
            ? `<option>(no broadcasts found)</option>`
            : broadcastNames.map(name => `<option value="${name}" ${node.data?.broadcastMessage === name ? 'selected' : ''}>${name}</option>`).join('');
        select.disabled = false;
        select.addEventListener('change', function(e) {
            node.data.broadcastMessage = e.target.value;
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
            let broadcastNames = [];
            if (typeof window.getScratchBroadcastNames === 'function') {
                broadcastNames = window.getScratchBroadcastNames();
            }
            updateDropdown(broadcastNames);
        } else if (attempts < 30) {
            setTimeout(() => waitForVMAndUpdate(attempts + 1), 100);
        } else {
            updateDropdown([]);
        }
    }
    waitForVMAndUpdate();
};
