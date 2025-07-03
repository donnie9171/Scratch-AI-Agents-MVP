class RunTextNode extends window.RunNode {
    async run() {
        let outputValue = '';
        if(this.node.inputs && this.node.inputs.length > 0) {
            // If there are inputs, we can process them
            const inputNodes = this.getInputs();
            for (const inputNode of inputNodes) {
                if(inputNode.type !== "receiver"){
                    outputValue += window.runtimeState.getNodeState(inputNode.id)?.outputValue || '';
                }else{
                    outputValue = this.node.data?.notepadContent || ''; // use this notepad content if input is a receiver
                }
                
            }
            this.node.data.notepadContent = outputValue;
        }else{
            outputValue = this.node.data?.notepadContent || '';
        }
        this.setOutputValue(outputValue);
        return;
    }
}

window.RunTextNode = RunTextNode;