window.inspectorToolPanels['comment'] = function(node, panelEl) {
    panelEl.innerHTML = `
        <div id="comment-panel-container" style="display: flex; height: 100%;">
            <div id="comment-editor" style="flex: 1; padding: 10px; overflow: auto;">
                <textarea id="markdown-editor" style="font-family: monospace;">${node.data.markdown || ''}</textarea>
            </div>
            <div id="resize-handle" style="width: 5px; cursor: ew-resize; background: #5269ff; position: relative;">
                <button id="hide-editor" class="hide-button left" style="position: absolute;  top: 50%; transform: translateY(-50%);">◀</button>
                <button id="hide-preview" class="hide-button right" style="position: absolute; top: 50%; transform: translateY(-50%);">▶</button>
            </div>
            <div id="comment-preview" style="flex: 1; padding: 10px; overflow: auto;">
                <div id="markdown-preview">${marked.parse(node.data.markdown || '')}</div>
            </div>
        </div>
    `;

    const editor = panelEl.querySelector('#markdown-editor');
    const preview = panelEl.querySelector('#markdown-preview');
    const resizeHandle = panelEl.querySelector('#resize-handle');
    const editorDiv = panelEl.querySelector('#comment-editor');
    const previewDiv = panelEl.querySelector('#comment-preview');
    const hideEditorButton = panelEl.querySelector('#hide-editor');
    const hidePreviewButton = panelEl.querySelector('#hide-preview');

    editor.addEventListener('input', function() {
        node.data.markdown = editor.value;
        preview.innerHTML = marked.parse(editor.value);

        // Update the node data in localStorage
        const saveObj = {
            metadata: {
                lastScratchProjectId: window.lastScratchProjectId || null
            },
            nodes: window.nodeData
        };
        localStorage.setItem('nodes', JSON.stringify(saveObj));
    });

    let isResizing = false;
    let startX = 0;
    let startEditorWidth = 0;

    resizeHandle.addEventListener('mousedown', function(e) {
        // Only start resizing if the handle itself is clicked, not the buttons
        if (e.target !== resizeHandle) return;
        isResizing = true;
        startX = e.clientX + 20;
        startEditorWidth = editorDiv.offsetWidth;
        document.body.style.cursor = 'ew-resize';
        document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', function(e) {
        if (!isResizing) return;
        // Ensure both panels are visible while resizing
        if (editorDiv.style.display === 'none') {
            editorDiv.style.display = '';
            editorDiv.style.flex = `0 0 1px`;
        }
        if (previewDiv.style.display === 'none') {
            previewDiv.style.display = '';
        }
        const deltaX = e.clientX - startX;
        const newEditorWidth = startEditorWidth + deltaX;
        const containerWidth = panelEl.querySelector('#comment-panel-container').offsetWidth;
        const minPanelWidth = 0; // Allow resizing to 0px
        const maxEditorWidth = containerWidth - minPanelWidth;
        if (newEditorWidth > minPanelWidth && newEditorWidth < maxEditorWidth) {
            editorDiv.style.flex = `0 0 ${newEditorWidth}px`;
            previewDiv.style.flex = `1 1 0`;
        }
    });

    document.addEventListener('mouseup', function() {
        if (isResizing) {
            isResizing = false;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }
    });

    hideEditorButton.addEventListener('click', function() {
        if (previewDiv.style.display === 'none') {
            // If editor is hidden, show both
            editorDiv.style.display = '';
            previewDiv.style.display = '';
            editorDiv.style.flex = '1';
            previewDiv.style.flex = '1';
        } else {
            // Hide the editor
            editorDiv.style.display = 'none';
            previewDiv.style.flex = '1';
        }
    });

    hidePreviewButton.addEventListener('click', function() {
        if (editorDiv.style.display === 'none') {
            // If preview is hidden, show both
            editorDiv.style.display = '';
            previewDiv.style.display = '';
            editorDiv.style.flex = '1';
            previewDiv.style.flex = '1';
        } else {
            // Hide the preview
            previewDiv.style.display = 'none';
            editorDiv.style.flex = '1';
        }
    });

    // Trigger the hide editor event on initialization
    hideEditorButton.click();
};
