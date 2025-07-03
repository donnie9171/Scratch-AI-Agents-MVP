class RunBroadcasterNode extends window.RunNode {
    async run() {
        window.sendBroadcastMessage(this.node.data?.broadcastMessage || '');
        this.setOutputValue(this.node.data?.broadcastMessage || '');
        return;
    }
}

window.RunBroadcasterNode = RunBroadcasterNode;