class RunCommentNode extends window.RunNode {
    // comment node does nothing
    async run() {
        let outputValue = '';
        this.setOutputValue(outputValue);
        return;
    }
}

window.RunCommentNode = RunCommentNode;