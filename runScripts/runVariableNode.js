class RunVariableNode extends window.RunNode {
    async run() {
        let outputValue = '';
        if(this.node.inputs && this.node.inputs.length > 0) {
            // If there are inputs, we can process them
            const inputNodes = this.getInputs();
            for (const inputNode of inputNodes) {
                outputValue += window.runtimeState.getNodeState(inputNode.id)?.outputValue || '';
            }
            setScratchVariableValue(this.node.data?.variableName || '', outputValue);
        }else{
            // no input only get the variable value
            outputValue = getScratchVariableValue(this.node.data?.variableName || '');
        }
        this.setOutputValue(outputValue);
        return;
    }
}

window.RunVariableNode = RunVariableNode;