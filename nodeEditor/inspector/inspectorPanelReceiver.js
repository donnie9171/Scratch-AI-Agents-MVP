import { setupReceiverNode } from "../../helper/setupReceiverNode";

window.inspectorToolPanels["receiver"] = function (node, panelEl) {
    // Render panel immediately with placeholder dropdown, then update when VM is ready
    panelEl.innerHTML = `
        <div>
            <p>Receive Message:</p>
            <select id="receive-message-select" style="margin-bottom: 12px;" disabled>
                <option>Waiting for VM to load...</option>
            </select>
        </div>
    `;

    function updateDropdown(broadcastNames) {
        const select = panelEl.querySelector('#receive-message-select');
        if (!select) return;
        select.innerHTML = broadcastNames.length === 0
            ? `<option>(no broadcasts found)</option>`
            : broadcastNames.map(name => `<option value="${name}" ${node.data?.receiverMessage === name ? 'selected' : ''}>${name}</option>`).join('');
        select.disabled = false;
        select.addEventListener('change', function(e) {
            node.data.receiverMessage = e.target.value;
            const saveObj = {
                metadata: {
                    lastScratchProjectId: window.lastScratchProjectId || null
                },
                nodes: window.nodeData
            };
            localStorage.setItem('nodes', JSON.stringify(saveObj));
            // re-register listener with new value
            setupReceiverNode(node);
        });
    }

    window.waitForVMAndUpdate(window.getScratchBroadcastNames, updateDropdown);
};
