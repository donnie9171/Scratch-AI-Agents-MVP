function setupReceiverNode(node) {
  // Clean up any existing listener
  if (node._currentBroadcastListener) {
    window.removeEventListener("message", node._currentBroadcastListener);
  }

  // Only if the node has a message name set
  if (node.data && node.data.receiverMessage) {
    const messageName = node.data.receiverMessage;
    const listener = function (event) {
      if (event.data.type === "scratchBroadcast" && event.data.message === messageName) {
        console.log(`[Node ${node.id}] received broadcast:`, messageName);
        window.runNodeCluster(node.id);
      }
    };
    window.addEventListener("message", listener);
    node._currentBroadcastListener = listener;
  }
}
window.setupReceiverNode = setupReceiverNode;
export { setupReceiverNode }