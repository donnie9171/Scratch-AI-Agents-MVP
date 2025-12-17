window.inspectorToolPanels["tool:servo"] = function (node, panelEl) {
  // Render panel with a Servo Key text field
  const servoKey = node.data?.servoKey || "";

  panelEl.innerHTML = `
    <div>
      <label for="servo-key-input" style="font-weight:500;">Servo Key:</label>
      <input 
        id="servo-key-input"
        type="text"
        maxlength="32"
        placeholder="Enter servo key"
        value="${servoKey.replace(/"/g, '&quot;')}"
        style="width: 80%; margin-bottom: 12px; padding: 4px 8px; border-radius: 5px; border: 1px solid #444; background: #18192a; color: #fff;"
      />
    </div>
  `;

  // Save changes to node.data and localStorage
  const input = panelEl.querySelector("#servo-key-input");
  if (input) {
    input.addEventListener("input", function (e) {
      node.data.servoKey = e.target.value;
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