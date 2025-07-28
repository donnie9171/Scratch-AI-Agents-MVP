
// Shared function to wait for VM readiness and call a callback with the appropriate names
window.waitForVMAndUpdate = function(getNamesFn, updateDropdownFn, attempts = 0) {
    if (typeof window.checkVMReady === "function" && window.checkVMReady()) {
        let names = [];
        if (typeof getNamesFn === "function") {
            names = getNamesFn();
        }
        updateDropdownFn(names);
    } else {
        setTimeout(() => window.waitForVMAndUpdate(getNamesFn, updateDropdownFn, attempts + 1), 100);
    }
};
// Returns the current costume or backdrop name for a given target name, using project JSON from TurboWarp proxy
// Usage: window.getScratchCurrentCostumeName(targetName, callback)
window.getScratchCurrentCostumeName = function(targetName, callback) {
    if (window.scaffolding && window.scaffolding.vm && typeof window.scaffolding.vm.toJSON === 'function') {
        let projectJsonRaw = window.scaffolding.vm.toJSON();
        let projectJson;
        if (typeof projectJsonRaw === 'string') {
            projectJson = JSON.parse(projectJsonRaw);
        } else if (projectJsonRaw instanceof ArrayBuffer || projectJsonRaw instanceof Uint8Array) {
            // Convert buffer to string, then parse
            const str = new TextDecoder().decode(projectJsonRaw);
            projectJson = JSON.parse(str);
        } else {
            projectJson = projectJsonRaw; // Already an object
        }

        if (projectJson.targets) {
            for (const target of projectJson.targets) {
                if (target.name === targetName) {
                    // For stage, use costumes array and currentCostume index
                    if (target.isStage && Array.isArray(target.costumes) && typeof target.currentCostume === 'number') {
                        const costume = target.costumes[target.currentCostume];
                        if (costume && costume.name) {
                            callback(costume.name);
                            return;
                        }
                    }
                    // For sprite, use costumes array and currentCostume index
                    if (!target.isStage && Array.isArray(target.costumes) && typeof target.currentCostume === 'number') {
                        const costume = target.costumes[target.currentCostume];
                        if (costume && costume.name) {
                            callback(costume.name);
                            return;
                        }
                    }
                }
            }
        }
        // If no target found or no costumes, return empty string
        callback('no costume found');
    } else {
        console.warn('Scratch VM or toJSON() not available');
    }
}
// Returns a list of all target names (sprites and stage) in the Scratch VM
window.getScratchTargetNames = function() {
    let targetNames = [];
    try {
        if (
            window.scaffolding &&
            window.scaffolding.vm &&
            window.scaffolding.vm.runtime &&
            window.scaffolding.vm.runtime.targets
        ) {
            const targets = window.scaffolding.vm.runtime.targets;
            for (const target of targets) {
                if (target && target.sprite && target.sprite.name) {
                    targetNames.push(target.sprite.name);
                } else if (target && target.isStage && target.isStage === true && target.name) {
                    // Stage target
                    targetNames.push(target.name);
                } else if (target && target.name) {
                    targetNames.push(target.name);
                }
            }
        }
    } catch (e) {}
    // Remove duplicates
    return Array.from(new Set(targetNames));
}
// Returns true if the Scratch VM is ready
window.checkVMReady = function() {
    return !!(
        window.scaffolding &&
        window.scaffolding.vm &&
        window.scaffolding.vm.runtime &&
        window.scaffolding.vm.runtime.targets &&
        window.scaffolding.vm.runtime.targets.length > 0
    );
}
// Returns a list of all variable names in the Scratch VM
window.getScratchVariableNames = function() {
    let variableNames = [];
    try {
        if (
            window.scaffolding &&
            window.scaffolding.vm &&
            window.scaffolding.vm.runtime &&
            window.scaffolding.vm.runtime.targets
        ) {
            const targets = window.scaffolding.vm.runtime.targets;
            for (const target of targets) {
                if (target.variables) {
                    for (const [id, variable] of Object.entries(target.variables)) {
                        let varName = variable.name || (Array.isArray(variable) ? variable[0] : undefined);
                        // Only include variables with type === ''
                        if (varName && (variable.type === '' || variable.type === 'list' || variable.type === undefined)) {
                            variableNames.push(varName);
                        }
                    }
                }
            }
        }
    } catch (e) {}
    // Remove duplicates
    return Array.from(new Set(variableNames));
}

window.getScratchBroadcastNames = function() {
    let broadcastNames = [];
    try {
        if (
            window.scaffolding &&
            window.scaffolding.vm &&
            window.scaffolding.vm.runtime &&
            window.scaffolding.vm.runtime.targets
        ) {
            const targets = window.scaffolding.vm.runtime.targets;
            for (const target of targets) {
                if (target.variables) {
                    for (const [id, variable] of Object.entries(target.variables)) {
                        let varName = variable.name || (Array.isArray(variable) ? variable[0] : undefined);
                        // Only include broadcasts with type === 'broadcast_msg'
                        if (varName && variable.type === 'broadcast_msg') {
                            broadcastNames.push(varName);
                        }
                    }
                }
            }
        }
    } catch (e) {}
    // Remove duplicates
    return Array.from(new Set(broadcastNames));
}
window.reloadScratchIframe = function(projectId) {
    const iframe = document.getElementById('scratch-iframe');
    if (!iframe) return;
    // Force reload by clearing src first
    iframe.src = '';
    setTimeout(() => {
        iframe.src = `projectPlayer.html#${projectId}`;
    }, 10);
};

document.getElementById('load-scratch-project').onclick = function() {
    let input = document.getElementById('scratch-project-id').value.trim();
    let match = input.match(/(\d{5,})/);
    if (!match) {
        alert('Please enter a valid Scratch project ID or URL.');
        return;
    }
    const projectId = match[1];
    // Save last loaded project ID to localStorage (legacy)
    localStorage.setItem('lastScratchProjectId', projectId);

    // Save to node save structure
    window.lastScratchProjectId = projectId;
    if (window.nodeData) {
        const saveObj = {
            metadata: {
                lastScratchProjectId: window.lastScratchProjectId || null
            },
            nodes: window.nodeData
        };
        localStorage.setItem('nodes', JSON.stringify(saveObj));
    }
    window.reloadScratchIframe(projectId);
};

// On page load, restore last loaded project if available
window.addEventListener('DOMContentLoaded', function() {
    let lastId = null;
    // Try new structure first
    const saved = localStorage.getItem('nodes');
    if (saved) {
        try {
            const saveObj = JSON.parse(saved);
            lastId = saveObj.metadata?.lastScratchProjectId || null;
        } catch (e) {}
    }
    // Fallback to legacy
    if (!lastId) lastId = localStorage.getItem('lastScratchProjectId');
    if (lastId) {
        document.getElementById('scratch-project-id').value = lastId;
        window.lastScratchProjectId = lastId;
        window.reloadScratchIframe(lastId);
    }
});

document.getElementById('GreenFlagBtn').onclick = function() {
    const iframe = document.getElementById('scratch-iframe');
    if (iframe && iframe.contentWindow && typeof iframe.contentWindow.start === 'function') {
        iframe.contentWindow.start();
    } else if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({type: 'start'}, '*');
    }
    // Return focus to the iframe
    if (iframe) iframe.focus();
};
document.getElementById('StopBtn').onclick = function() {
    const iframe = document.getElementById('scratch-iframe');
    if (iframe && iframe.contentWindow && typeof iframe.contentWindow.stop === 'function') {
        iframe.contentWindow.stop();
    } else if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({type: 'stop'}, '*');
    }
    // Return focus to the iframe
    if (iframe) iframe.focus();
};

const iframe = document.getElementById('scratch-iframe');
iframe.addEventListener('load', function() {
    // Wait for the iframe to finish loading, then assign its scaffolding to the parent window
    if (iframe.contentWindow && iframe.contentWindow.scaffolding) {
        window.scaffolding = iframe.contentWindow.scaffolding;
    } else {
        // If scaffolding might be set later, you can poll for it:
        const checkScaffolding = setInterval(() => {
            if (iframe.contentWindow && iframe.contentWindow.scaffolding) {
                window.scaffolding = iframe.contentWindow.scaffolding;
                clearInterval(checkScaffolding);
            }
        }, 100);
    }
});

window.getScratchVariableValue = function(variableName) {
    if (!variableName) return '';
    try {
        if (
            window.scaffolding &&
            window.scaffolding.vm &&
            window.scaffolding.vm.runtime &&
            window.scaffolding.vm.runtime.targets
        ) {
            const targets = window.scaffolding.vm.runtime.targets;
            for (const target of targets) {
                if (target.variables) {
                    for (const [id, variable] of Object.entries(target.variables)) {
                        let varName = variable.name || (Array.isArray(variable) ? variable[0] : undefined);
                        if (
                            varName &&
                            varName.toLowerCase() === variableName.toLowerCase()
                        ) {
                            return (typeof variable.value !== "undefined")
                                ? variable.value
                                : (Array.isArray(variable) ? variable[1] : '');
                        }
                    }
                }
            }
        }
    } catch (e) {
        return '(error reading variable)';
    }
    return '';
}

window.setScratchVariableValue = function(variableName, value) {
    if (!variableName || typeof value === 'undefined') return;
    try {
        if (
            window.scaffolding &&
            window.scaffolding.vm &&
            window.scaffolding.vm.runtime &&
            window.scaffolding.vm.runtime.targets
        ) {
            const targets = window.scaffolding.vm.runtime.targets;
            for (const target of targets) {
                if (target.variables) {
                    for (const [id, variable] of Object.entries(target.variables)) {
                        let varName = variable.name || (Array.isArray(variable) ? variable[0] : undefined);
                        if (
                            varName &&
                            varName.toLowerCase() === variableName.toLowerCase()
                        ) {
                            variable.value = value;
                            return;
                        }
                    }
                }
            }
        }
    } catch (e) {
        console.error('Error setting variable:', e);
    }
}

window.addEventListener("message", (event) => {
  if (event.data.type === 'scratchBroadcast') {
    console.log('Broadcast from inside iframe:', event.data.message);
  }
});

window.sendBroadcastMessage = function(message) {
    const iframe = document.getElementById('scratch-iframe');
    if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({ type: 'triggerScratchBroadcast', message }, '*');
    } else {
        console.warn('Scratch iframe not found or not loaded.');
    }
}