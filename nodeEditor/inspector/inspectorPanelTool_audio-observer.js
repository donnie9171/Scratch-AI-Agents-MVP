window.inspectorToolPanels["tool:audio-observer"] = function (node, panelEl) {
  // No configuration needed for MVP
  const lastMagnitude = typeof node.data.lastMagnitude === "number" ? node.data.lastMagnitude : "(not running)";
  panelEl.innerHTML = `
    <div>
      <label style="font-weight:500;">Audio Observer (Global)</label>
      <div style="margin-top: 12px;">
        <span>Current Magnitude: <b id="audio-observer-magnitude">${lastMagnitude}</b></span>
      </div>
      <div style="margin-top: 8px; color: #888; font-size: 13px;">
        This node outputs the real-time global audio magnitude.
      </div>
    </div>
  `;
};