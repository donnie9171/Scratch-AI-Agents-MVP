class RunAudioObserverNode extends window.RunNode {
    async run() {
        const magnitude = window.document.getElementById("scratch-iframe").contentWindow.audioMagnitude;
        this.setOutputValue(magnitude);
        // Update inspector panel display if present
        this.node.data.lastMagnitude = magnitude;
        const el = document.getElementById('audio-observer-magnitude');
        if (el) el.textContent = typeof magnitude === "number" ? magnitude : "(not running)";
    }
}

window.RunAudioObserverNode = RunAudioObserverNode;