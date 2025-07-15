// document.getElementById('load-nodes').onclick = function() {
//     document.getElementById('load-project-modal').style.display = 'flex';
// };
document.getElementById('close-load-project').onclick = function() {
    document.getElementById('load-project-modal').style.display = 'none';
};
document.getElementById('load-project-confirm').onclick = function() {
    try {
        const text = document.getElementById('load-project-text').value;
        const saveObj = JSON.parse(text);
        localStorage.setItem('nodes', JSON.stringify(saveObj));
        window.loadNodes();
        document.getElementById('load-project-modal').style.display = 'none';
    } catch (e) {
        alert('Invalid project data!');
    }
};
