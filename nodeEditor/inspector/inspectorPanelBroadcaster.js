window.inspectorToolPanels["broadcaster"] = function (node, panelEl) {
  panelEl.innerHTML = `
        <div>
            <p>Broadcast Message:</p>
            <input type="text" id="broadcast-message-input" value="${
              node.data?.broadcastMessage || ""
            }" style="margin-bottom: 12px;">
        </div>
    `;

  panelEl
    .querySelector("#broadcast-message-input")
    .addEventListener("input", function (e) {
      node.data.broadcastMessage = e.target.value;
      const saveObj = {
        metadata: {
          lastScratchProjectId: window.lastScratchProjectId || null,
        },
        nodes: window.nodeData,
      };
      localStorage.setItem("nodes", JSON.stringify(saveObj));
    });
};
