class RunTextNode extends window.RunNode {
    async run() {
        // 1. Gather input nodes
        const inputNodes = this.getInputs() || [];
        // 2. Build a lookup of input labels to their output values
        const inputValues = {};
        for (const inputNode of inputNodes) {
            // Use label if available, else id
            const label = inputNode.data?.label || inputNode.id;
            inputValues[label] = window.runtimeState.getNodeState(inputNode.id)?.outputValue || '';
        }

        // 3. Get the notepad content string
        let content = this.node.data?.notepadContent || '';

        // 4. Replace all {{input}} tags with matching input values
        // Supports tags like {{red name}}, {{blue name}}, etc.
        const parsedContent = content.replace(/\{\{([^}]+)\}\}/g, (match, p1) => {
            // Trim spaces in tag
            const key = p1.trim();
            return inputValues[key] !== undefined ? inputValues[key] : match;
        });

        // 5. Set output and display in the notepad output div
        this.setOutputValue(parsedContent);

        // Display in <p id="notepad-output-display">
        const outputEl = document.getElementById('notepad-output-display');
        if (outputEl) {
            outputEl.textContent = parsedContent || '(empty)';
        }
        return;
    }
}

window.RunTextNode = RunTextNode;