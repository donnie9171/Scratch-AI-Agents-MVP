class RunCostumeNode extends window.RunNode {
  async run() {
    let outputValue = "";
    const spriteName = this.node.data?.spriteName || "";
    if (this.node.inputs && this.node.inputs.length > 0) {
      const inputNodes = this.getInputs();
      // If all inputs are receivers, just get the costume name
      if (inputNodes.every((inputNode) => inputNode.type === "receiver")) {
        await new Promise((resolve) => {
          window.getScratchCurrentCostumeName(spriteName, (costumeName) => {
            outputValue = costumeName || "";
            resolve();
          });
        });
      } else {
        for (const inputNode of inputNodes) {
          outputValue +=
            window.runtimeState.getNodeState(inputNode.id)?.outputValue || "";
        }
        if (typeof window.setScratchCostumeName === "function") {
          window.setScratchCostumeName(spriteName, outputValue);
        }
      }
    } else {
      // No input: just get the costume name
      await new Promise((resolve) => {
        window.getScratchCurrentCostumeName(spriteName, (costumeName) => {
          outputValue = costumeName || "";
          resolve();
        });
      });
    }
    this.setOutputValue(outputValue);
    return;
  }
}

window.RunCostumeNode = RunCostumeNode;