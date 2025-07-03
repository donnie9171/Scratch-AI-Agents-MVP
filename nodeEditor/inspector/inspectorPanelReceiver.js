window.inspectorToolPanels["receiver"] = function (node, panelEl) {
  panelEl.innerHTML = `
    <div>
      <p>Receive Message:</p>
      <input type="text" id="receive-message-input" value="${
        node.data?.receiverMessage || ""
      }" style="margin-bottom: 12px;">
    </div>
  `;

  const inputEl = panelEl.querySelector("#receive-message-input");

  inputEl.addEventListener("input", function (e) {
  node.data.receiverMessage = e.target.value;

  const saveObj = {
    metadata: {
      lastScratchProjectId: window.lastScratchProjectId || null,
    },
    nodes: window.nodeData,
  };
  localStorage.setItem("nodes", JSON.stringify(saveObj));

  // re-register listener with new value
  setupReceiverNode(node);
});
};
