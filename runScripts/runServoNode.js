class RunServoNode extends window.RunNode {
  async run() {
    // Get the servo key from node data
    const servoKey = this.node.data?.servoKey || "";
    let inputValue = "";

    // Gather input value(s)
    if (this.node.inputs && this.node.inputs.length > 0) {
      const inputNodes = this.getInputs();
      for (const inputNode of inputNodes) {
        inputValue += window.runtimeState.getNodeState(inputNode.id)?.outputValue || "";
      }
    }

    // Send browser event if key is present
    if (servoKey && typeof window.connection?.send === "function") {
      window.connection.send("browser-event", { [servoKey]: inputValue });
    }

    // Set output to the same as input
    this.setOutputValue(inputValue);
    return;
  }
}

window.RunServoNode = RunServoNode;