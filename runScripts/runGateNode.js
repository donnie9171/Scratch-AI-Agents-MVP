function makeFlexiblePattern(snippet) {
    // Extract words (alphanumeric, no underscores or punctuation)
    const words = Array.from(snippet.matchAll(/[^\W_]+/gu), m => m[0]);
    if (!words.length) return null;
    let pattern = '[\\W_]*' + escapeRegExp(words[0]);
    for (let i = 1; i < words.length; i++) {
        pattern += '.{0,20}' + escapeRegExp(words[i]);
    }
    pattern += '[\\W_]*';
    return pattern;
}

// Helper to escape regex special characters
function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function removeInjection(text, injection) {
    const pat = makeFlexiblePattern(injection);
    if (!pat) return null;
    const re = new RegExp(pat, 'giu'); // global, ignore case, unicode
    const cleaned = text.replace(re, '');
    return cleaned !== text ? cleaned : null;
}

class RunGateNode extends window.RunNode {
    async run() {
        // 1. Gather input nodes and their output values
        const inputNodes = this.getInputs() || [];
        const inputValues = {};
        for (const inputNode of inputNodes) {
            const label = inputNode.data?.label || inputNode.id;
            inputValues[label] = window.runtimeState.getNodeState(inputNode.id)?.outputValue || '';
        }

        // 2. Get gate data and settings
        const gateData = this.node.data?.gateDataInput || '';
        const listRaw = this.node.data?.gateListInput || '';
        const listType = this.node.data?.listType || 'block'; // 'block' or 'allow'
        const matchType = this.node.data?.matchType || 'exact'; // 'exact' or 'fuzzy'

        // 3. Parse list: first replace input tags, then split by comma and trim spaces
        let parsedListRaw = listRaw.replace(/\{\{([^}]+)\}\}/g, (match, p1) => {
            const key = p1.trim();
            return inputValues[key] !== undefined ? inputValues[key] : match;
        });
        let list = parsedListRaw.split(',').map(s => s.trim()).filter(Boolean);

        // 4. Replace any {{input}} tags in gateData with input values
        const processedData = gateData.replace(/\{\{([^}]+)\}\}/g, (match, p1) => {
            const key = p1.trim();
            return inputValues[key] !== undefined ? inputValues[key] : match;
        });

        // Log out the processed data and list for debugging
        console.log('GateNode processedData:', processedData);
        console.log('GateNode list:', list);

        // 5. Gate logic (string filtering)
        let output = processedData;

        if (listType === 'block') {
            // Remove all list items from the string
            list.forEach(item => {
                if (matchType === 'exact') {
                    // Remove exact matches (whole words)
                    output = output.split(item).join('');
                } else if (matchType === 'fuzzy') {
                    // fuzzy matching from the promptarmor paper
                    list.forEach(item => {
                        let cleaned = removeInjection(output, item);
                        if (cleaned !== null) output = cleaned;
                    });
                }
            });
        } else if (listType === 'allow') {
            if (matchType === 'exact') {
                // Keep only exact matches (whole words), remove everything else
                // Split into words, keep only those in the list
                output = output
                    .split(/\b/)
                    .filter(word => list.includes(word))
                    .join('');
            } else if (matchType === 'fuzzy') {
                // Keep only substrings that match any list item, using flexible pattern
                let allowed = [];
                list.forEach(item => {
                    const pat = makeFlexiblePattern(item);
                    if (!pat) return;
                    const re = new RegExp(pat, 'giu');
                    let match;
                    while ((match = re.exec(output)) !== null) {
                        allowed.push(match[0]);
                    }
                });
                output = allowed.join('');
            }
        }

        // 6. Set output and display in the gate output div
        this.setOutputValue(output);

        const outputEl = document.getElementById('gate-output-display');
        if (outputEl) {
            outputEl.textContent = output || '(empty)';
        }
        return;
    }
}

window.RunGateNode = RunGateNode;