class RunTextNode extends window.RunNode {
    async run() {
        console.log(`Running Text Node: ${this.node.id} with content "${this.node.data?.notepadContent || ''}"`);
        let outputValue = '';
        if(this.node.inputs && this.node.inputs.length > 0) {
            // If there are inputs, we can process them
            const inputNodes = this.getInputs();
            for (const inputNode of inputNodes) {
                outputValue += inputNode.data?.outputValue || '';
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