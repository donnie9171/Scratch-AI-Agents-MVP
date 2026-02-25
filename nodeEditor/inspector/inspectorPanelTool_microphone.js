window.inspectorToolPanels["tool:microphone"] = function (node, panelEl) {
  // Step 1: Gather connected input nodes (including receiver nodes)
  const inputNodes = Array.isArray(node.inputs)
    ? node.inputs
        .map((inputId) => window.nodeData.find((n) => n.id === inputId))
        .filter((n) => n) // allow all input nodes, including receiver
    : [];

  // Step 2: Gather microphone fields
  const micStatus = node.data?.micStatus || "off";
  const startTriggers = node.data?.startTriggers || "";
  const stopTriggers = node.data?.stopTriggers || "";
  const language = node.data?.language || "en-US";
  const liveTranscription = window.runtimeState.getNodeState(node.id)?.transcription || "(empty)";

  // Step 3: Render Inputs List
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

  // Step 4: Render panel
  // Mic status indicator styles
  let micStatusColor = '#888';
  let micStatusText = 'Unknown';
  if (micStatus === 'listening') {
    micStatusColor = '#ff0000';
    micStatusText = 'Listening';
  } else if (micStatus === 'off') {
    micStatusColor = '#aaa';
    micStatusText = 'Off';
  } else if (micStatus === 'error') {
    micStatusColor = '#e53935';
    micStatusText = 'Error';
  }

  panelEl.innerHTML = `
    <div>
        <p>Mic Status:</p>
        <span id="mic-status-indicator" style="display: inline-block; padding: 6px 16px; border-radius: 8px; background: ${micStatusColor}; color: #fff; font-weight: bold; margin-bottom: 8px;">${micStatusText}</span>
        ${inputsHtml}
        <p>Start Triggers (drag and drop):</p>
        <textarea 
            id="mic-start-triggers"
            placeholder="(empty)"
            style="width: 90%; resize: vertical; color: #aaa; background: #18192a; border: 1px solid #444; border-radius: 6px; padding: 4px;">${
              startTriggers ? startTriggers : ""
            }</textarea>
        <p>Stop Triggers (drag and drop):</p>
        <textarea 
            id="mic-stop-triggers"
            placeholder="(empty)"
            style="width: 90%; resize: vertical; color: #aaa; background: #18192a; border: 1px solid #444; border-radius: 6px; padding: 4px;">${
              stopTriggers ? stopTriggers : ""
            }</textarea>
        <p>Language:</p>
        <select id="mic-language">
            <option value="en-US" ${language === "en-US" ? "selected" : ""}>English (US)</option>
            <option value="en-GB" ${language === "en-GB" ? "selected" : ""}>English (UK)</option>
            <option value="es-ES" ${language === "es-ES" ? "selected" : ""}>Spanish (Spain)</option>
            <option value="fr-FR" ${language === "fr-FR" ? "selected" : ""}>French (France)</option>
            <option value="de-DE" ${language === "de-DE" ? "selected" : ""}>German (Germany)</option>
            <option value="zh-TW" ${language === "zh-TW" ? "selected" : ""}>Mandarin (Taiwan)</option>
            <option value="ja-JP" ${language === "ja-JP" ? "selected" : ""}>Japanese</option>
            <option value="ko-KR" ${language === "ko-KR" ? "selected" : ""}>Korean</option>
            <option value="ru-RU" ${language === "ru-RU" ? "selected" : ""}>Russian</option>
            <!-- Add more as needed -->
        </select>
        <p>Live Transcription:</p>
        <div id="mic-live-transcription" style="width: 90%; min-height: 32px; color: #fff; background: #222; border: 1px solid #444; border-radius: 6px; padding: 4px;">${liveTranscription}</div>
    </div>
    `;

  // Step 5: Drag and drop for input tokens
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
        e.dataTransfer.setDragImage(dragBadge, dragBadge.offsetWidth / 2, 0);
        setTimeout(() => document.body.removeChild(dragBadge), 0);
    });
  });

  // Step 6: Save changes
  // ...existing code...

  panelEl.querySelector("#mic-start-triggers").addEventListener("input", function (e) {
    node.data.startTriggers = e.target.value;
    const saveObj = {
      metadata: {
        lastScratchProjectId: window.lastScratchProjectId || null,
      },
      nodes: window.nodeData,
    };
    localStorage.setItem("nodes", JSON.stringify(saveObj));
  });

  panelEl.querySelector("#mic-stop-triggers").addEventListener("input", function (e) {
    node.data.stopTriggers = e.target.value;
    const saveObj = {
      metadata: {
        lastScratchProjectId: window.lastScratchProjectId || null,
      },
      nodes: window.nodeData,
    };
    localStorage.setItem("nodes", JSON.stringify(saveObj));
  });

  panelEl.querySelector("#mic-language").addEventListener("change", function (e) {
    node.data.language = e.target.value;
    const saveObj = {
      metadata: {
        lastScratchProjectId: window.lastScratchProjectId || null,
      },
      nodes: window.nodeData,
    };
    localStorage.setItem("nodes", JSON.stringify(saveObj));
  });
};
