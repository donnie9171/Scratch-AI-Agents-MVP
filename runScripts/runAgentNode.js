class RunAgentNode extends window.RunNode {
    async run() {
        await new Promise(resolve => setTimeout(resolve, 1500)); //dummy timeout to test queue and running icons
        return;
    }
}

window.RunAgentNode = RunAgentNode;