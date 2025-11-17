window.inspectorToolPanels["tool:gate"] = function (node, panelEl) {
  // Step 1: Gather connected input nodes
const inputNodes = Array.isArray(node.inputs)
    ? node.inputs
        .map((inputId) => window.nodeData.find((n) => n.id === inputId))
        .filter((n) => n && n.type !== "receiver") // filter out missing nodes and receiver nodes
    : [];

  const gateDataInput = node.data?.gateDataInput || "";
    const gateListInput = node.data?.gateListInput || "";
    const listType = node.data?.listType || "block";
const matchType = node.data?.matchType || "exact";
  let isEditable = true;
//   let isEditable = !Array.isArray(node.inputs) || node.inputs.length === 0;
//   if (
//     node.inputs.every(
//       (inputId) =>
//         window.nodeData.find((n) => n.id === inputId)?.type === "receiver"
//     )
//   ) {
//     isEditable = true;
//   }

  // Step 2: Render Inputs List above notepad contents
  let inputsHtml = "";
  if (inputNodes.length > 0) {
    inputsHtml = `
        <div style="margin-bottom: 12px;">
            <p>Inputs (drag and drop into the following fields):</p>
            <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 6px;">
                ${inputNodes
                  .map(
                    (n) => `
<span 
    class="notepadInputToken input-type-${n.type || "unknown"}${
                      n.type === "tool" && n.toolType
                        ? ` tool-type-${n.toolType}`
                        : ""
                    }"
    data-type="${n.type || ""}"
    data-tool-type="${n.toolType || ""}"
    title="${n.type}${n.toolType ? `:${n.toolType}` : ""}"
    draggable="true"
    data-label="${n.data.label || n.id}"
>
    ${n.data.label || n.id}
</span>
                `
                  )
                  .join("")}
            </div>
        </div>
    `;
  }

  const output = window.runtimeState.getNodeState(node.id)?.outputValue || '(empty)';

  panelEl.innerHTML = `
    <div>
        ${inputsHtml}
        <p>Data to process:</p>
        <textarea 
            id="gate-data-input"
            ${isEditable ? "" : "readonly"}
            placeholder="(empty)"
            style="width: 90%; resize: vertical; color: #aaa; background: #18192a; border: 1px solid #444; border-radius: 6px; padding: 4px;">${
              gateDataInput ? gateDataInput : ""
            }</textarea>
        <p>List (comma separated):</p>
        <textarea 
            id="gate-list-input"
            ${isEditable ? "" : "readonly"}
            placeholder="(empty)"
            style="width: 90%; resize: vertical; color: #aaa; background: #18192a; border: 1px solid #444; border-radius: 6px; padding: 4px;">${
              gateListInput ? gateListInput : ""
            }</textarea>
        <p>List settings:</p>
      <label for="list-type">List Type:</label>
          <select id="list-type">
              <option value="block" ${listType === "block" ? "selected" : ""}>block list</option>
              <option value="allow" ${listType === "allow" ? "selected" : ""}>allow list</option>
          </select>
      <label for="match-type">Match Type:</label>
          <select id="match-type">
              <option value="exact" ${matchType === "exact" ? "selected" : ""}>exact match</option>
              <option value="fuzzy" ${matchType === "fuzzy" ? "selected" : ""}>fuzzy match</option>
          </select>
      <p>Output:</p>
      <p id="gate-output-display">${output}</p>
    </div>
    `;

panelEl.querySelectorAll('.notepadInputToken').forEach(token => {
    token.addEventListener('dragstart', function(e) {
        e.dataTransfer.setData('text/plain', `{{${token.getAttribute('data-label')}}}`);
        e.dataTransfer.effectAllowed = 'copy';

        // Create a custom drag image
        const dragBadge = document.createElement('span');
        dragBadge.textContent = token.textContent;
        dragBadge.style.position = 'absolute';
        dragBadge.style.top = '-1000px'; // Move it off-screen
        dragBadge.style.pointerEvents = 'none';
        dragBadge.className = token.getAttribute('class');
        dragBadge.style.opacity = '0.8';

        document.body.appendChild(dragBadge);
        // Offset: 0 (x), 24 (y) so it appears below the cursor
        e.dataTransfer.setDragImage(dragBadge, dragBadge.offsetWidth / 2, 0);

        // Clean up after drag
        setTimeout(() => document.body.removeChild(dragBadge), 0);
    });
});


  if (isEditable) {
    panelEl
      .querySelector("#gate-data-input")
      .addEventListener("input", function (e) {
        node.data.gateDataInput = e.target.value;
        const saveObj = {
          metadata: {
            lastScratchProjectId: window.lastScratchProjectId || null,
          },
          nodes: window.nodeData,
        };
        localStorage.setItem("nodes", JSON.stringify(saveObj));
      });

    panelEl
      .querySelector("#gate-list-input")
      .addEventListener("input", function (e) {
        node.data.gateListInput = e.target.value;
        const saveObj = {
          metadata: {
            lastScratchProjectId: window.lastScratchProjectId || null,
          },
          nodes: window.nodeData,
        };
        localStorage.setItem("nodes", JSON.stringify(saveObj));
      });

    // Save list type
  panelEl.querySelector("#list-type").addEventListener("change", function (e) {
    node.data.listType = e.target.value;
    const saveObj = {
      metadata: {
        lastScratchProjectId: window.lastScratchProjectId || null,
      },
      nodes: window.nodeData,
    };
    localStorage.setItem("nodes", JSON.stringify(saveObj));
  });

  // Save match type
  panelEl.querySelector("#match-type").addEventListener("change", function (e) {
    node.data.matchType = e.target.value;
    const saveObj = {
      metadata: {
        lastScratchProjectId: window.lastScratchProjectId || null,
      },
      nodes: window.nodeData,
    };
    localStorage.setItem("nodes", JSON.stringify(saveObj));
  });
  }
};
