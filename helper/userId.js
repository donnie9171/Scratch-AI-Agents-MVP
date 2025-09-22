let userId = localStorage.getItem("agentUserId");
if (!userId) {
  if (crypto.randomUUID) {
    userId = crypto.randomUUID();
  } else {
    // Fallback UUID v4 generator
    userId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  localStorage.setItem("agentUserId", userId);
}

export { userId };