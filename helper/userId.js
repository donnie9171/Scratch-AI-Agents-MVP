let userId = localStorage.getItem("agentUserId");
if (!userId) {
  userId = crypto.randomUUID(); // Modern browsers
  localStorage.setItem("agentUserId", userId);
}

export { userId };