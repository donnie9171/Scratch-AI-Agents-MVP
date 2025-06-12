document.getElementById('load-scratch-project').onclick = function() {
    let input = document.getElementById('scratch-project-id').value.trim();
    // Extract project ID if a full URL is pasted
    let match = input.match(/(\d{5,})/);
    if (!match) {
        alert('Please enter a valid Scratch project ID or URL.');
        return;
    }
    const projectId = match[1];
    document.getElementById('scratch-iframe').src = `https://turbowarp.org/${projectId}/embed`;
};