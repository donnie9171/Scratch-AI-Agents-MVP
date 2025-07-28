window.inspectorToolPanels["tool:costume"] = function (node, panelEl) {
  // Render panel immediately with placeholder dropdown, then update when VM is ready
  // Render panel with placeholder for costume name
  const selectedTarget = node.data?.spriteName || "";
  const projectId =
    window.lastScratchProjectId ||
    document.getElementById("scratch-project-id")?.value ||
    "";
  panelEl.innerHTML = `
        <div>
            <p>Target:</p>
            <select id="costume-sprite-select" style="margin-bottom: 12px;" disabled>
                <option>Waiting for VM to load...</option>
            </select>
            <div style="margin-bottom: 8px; color: #aaa; font-size: 0.98em;">
                <span id="costume-name-label"></span>
            </div>
            <div style="margin-top: 12px;">
                <span class="variable-badge ${
                  isCostumeToolSet(node) ? "on" : "off"
                }">
                    ${isCostumeToolSet(node) ? "Set" : "Set (not connected)"}
                </span>
                <span class="variable-badge ${
                  isCostumeToolGet(node) ? "on" : "off"
                }" style="margin-left:16px;">
                    ${isCostumeToolGet(node) ? "Get" : "Get (not connected)"}
                </span>
            </div>
        </div>
    `;

  function updateDropdown(targetNames) {
    const select = panelEl.querySelector("#costume-sprite-select");
    const costumeLabel = panelEl.querySelector("#costume-name-label");
    if (!select) return;
    select.innerHTML =
      targetNames.length === 0
        ? `<option>(no targets found)</option>`
        : targetNames
            .map(
              (name) =>
                `<option value="${name}" ${
                  node.data?.spriteName === name ? "selected" : ""
                }>${name}</option>`
            )
            .join("");
    select.disabled = false;
    if (typeof window.getScratchCurrentCostumeName === "function") {
      window.getScratchCurrentCostumeName(
        node.data?.spriteName,
        function (costumeName) {
          if (costumeLabel)
            costumeLabel.innerHTML = costumeName
              ? `Current: <b>${costumeName}</b>`
              : "";
        }
      );
    }
    select.addEventListener("change", function (e) {
      node.data.spriteName = e.target.value;
      // Update costume label when callback returns
      if (typeof window.getScratchCurrentCostumeName === "function") {
        window.getScratchCurrentCostumeName(
          e.target.value,
          function (costumeName) {
            if (costumeLabel)
              costumeLabel.innerHTML = costumeName
                ? `Current: <b>${costumeName}</b>`
                : "";
          }
        );
      }
      const saveObj = {
        metadata: {
          lastScratchProjectId: window.lastScratchProjectId || null,
        },
        nodes: window.nodeData,
      };
      localStorage.setItem("nodes", JSON.stringify(saveObj));
    });
    // Also update costume label on initial dropdown render
    // For testing: do not update costume label on initial dropdown render
  }

  window.waitForVMAndUpdate(window.getScratchTargetNames, updateDropdown);
};

function isCostumeToolGet(node) {
  return Array.isArray(node.outputs) && node.outputs.length > 0;
}
function isCostumeToolSet(node) {
  return Array.isArray(node.inputs) && node.inputs.length > 0;
}
