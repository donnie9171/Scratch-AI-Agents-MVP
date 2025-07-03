class RunReceiverNode extends window.RunNode {
    async run() {
        let outputValue = '';
        this.setOutputValue(outputValue);
        return;
    }
}

window.RunReceiverNode = RunReceiverNode;