// loadDropdown.js - logic for the Load button dropdown menu
window.addEventListener('DOMContentLoaded', function() {
    const loadBtn = document.getElementById('load-nodes');
    function closeInspectorAndClearScratchIfNeeded(objOverride) {
        // Use objOverride if provided, otherwise read from localStorage
        let saveObj = objOverride || null;
        if (!saveObj) {
            try {
                saveObj = JSON.parse(localStorage.getItem('nodes'));
            } catch (e) { saveObj = null; }
        }
        // Close inspector if no selected node
        if (!saveObj || !saveObj.metadata || saveObj.metadata.selectedNode == null) {
            const inspectorModal = document.getElementById('inspector-modal');
            if (inspectorModal) {
                inspectorModal.classList.remove('active');
                document.body.classList.remove('inspector-open');
                document.querySelectorAll('.card.selected').forEach(el => el.classList.remove('selected'));
            }
        }
        // Clear Scratch project field if lastScratchProjectId is null
        if (!saveObj || !saveObj.metadata || saveObj.metadata.lastScratchProjectId == null) {
            const scratchInput = document.getElementById('scratch-project-id');
            if (scratchInput) scratchInput.value = '1197188623'; // fallback for if no project ID is set
            // Reload the Scratch iframe to clear the VM
            if (window.reloadScratchIframe) window.reloadScratchIframe('1197188623');
        }
        // Set project name field in save modal if present
        const projectNameInput = document.getElementById('json-modal-project-name');
        if (projectNameInput) {
            let projectName = (saveObj && saveObj.metadata && saveObj.metadata.projectName) ? saveObj.metadata.projectName : 'Untitled MEW Project';
            projectNameInput.value = projectName;
        }
    }

    new DropdownMenu({
        trigger: loadBtn,
        options: [
            {
                label: 'New empty project',
                id: 'dropdown-new-empty',
                onClick: function() {
                    const obj = { nodes: [], metadata: { lastScratchProjectId: "1197188623", projectName: "Untitled MEW Project" } };
                    localStorage.setItem('nodes', JSON.stringify(obj));
                    window.loadNodes();
                    closeInspectorAndClearScratchIfNeeded(obj);
                }
            },
            {
                label: 'Load demo',
                id: 'dropdown-load-demo',
                submenu: [
                    {
                        label: 'Rock Paper Scissors',
                        id: 'dropdown-demo-rps',
                        onClick: function() {
                            fetch('/demoProjects/demo_rockPaperScissors.json').then(r => r.json()).then(obj => {
                                if (!obj.metadata) obj.metadata = {};
                                if (!obj.metadata.projectName) obj.metadata.projectName = 'Rock Paper Scissors Demo';
                                localStorage.setItem('nodes', JSON.stringify(obj));
                                window.loadNodes();
                                closeInspectorAndClearScratchIfNeeded(obj);
                            });
                        }
                    },
                    {
                        label: 'Default Demo',
                        id: 'dropdown-demo-default',
                        onClick: function() {
                            fetch('/demoProjects/data.json').then(r => r.json()).then(obj => {
                                if (!obj.metadata) obj.metadata = {};
                                if (!obj.metadata.projectName) obj.metadata.projectName = 'Untitled MEW Project';
                                localStorage.setItem('nodes', JSON.stringify(obj));
                                window.loadNodes();
                                closeInspectorAndClearScratchIfNeeded(obj);
                            });
                        }
                    }
                ]
            },
            {
                label: 'Load from file',
                id: 'dropdown-load-file',
                onClick: function() {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.json,.txt,application/json,text/plain';
                    input.onchange = function(e) {
                        const file = e.target.files[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = function(ev) {
                            try {
                                const obj = JSON.parse(ev.target.result);
                                if (!obj.metadata) obj.metadata = {};
                                if (!obj.metadata.projectName) obj.metadata.projectName = 'Untitled MEW Project';
                                localStorage.setItem('nodes', JSON.stringify(obj));
                                window.loadNodes();
                                closeInspectorAndClearScratchIfNeeded(obj);
                                const projectId = obj?.metadata?.lastScratchProjectId;
                                if (projectId && window.reloadScratchIframe) {
                                    setTimeout(() => {
                                        window.reloadScratchIframe(projectId);
                                    }, 300);
                                }
                            } catch (err) {
                                alert('Invalid file format!');
                            }
                        };
                        reader.readAsText(file);
                    };
                    input.click();
                }
            },
            {
                label: 'Load from txt',
                id: 'dropdown-load-txt',
                onClick: function() {
                    document.getElementById('load-project-modal').style.display = 'flex';
                }
            }
        ],
        container: document.body,
        zIndex: 9999
    });
});
