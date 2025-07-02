// Example: runManager.js

// 1. Define the context object
const context = {
    getNodeById(id) {
        // Use the global nodeData array
        return window.nodeData.find(node => node.id === id);
    },
    // You can add more shared state or helpers here if needed
};

// 2. Choose the correct runner class based on node type
function getRunnerForNode(node) {
    switch (node.type) {
        case 'tool':
            if (node.toolType === 'variable') return new window.RunVariableNode(node, context);
            if (node.toolType === 'notepad') return new window.RunTextNode(node, context);
            // Add more tool types as needed
            break;
        default:
            return new window.RunNode(node, context); // fallback
    }
}

// 3. Run a node by ID
async function runNodeById(nodeId) {
    const node = context.getNodeById(nodeId);
    if (!node) {
        console.warn('Node not found:', nodeId);
        return;
    }
    const runner = getRunnerForNode(node);
    await runner.run();
}

// Helper: Find all clusters (connected components)
function findClusters(nodes) {
    const visited = new Set();
    const clusters = [];

    function dfs(node, cluster) {
        visited.add(node.id);
        cluster.push(node);
        const neighbors = [...(node.inputs || []), ...(node.outputs || [])]
            .map(id => nodes.find(n => n.id === id))
            .filter(Boolean);
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor.id)) {
                dfs(neighbor, cluster);
            }
        }
    }

    for (const node of nodes) {
        if (!visited.has(node.id)) {
            const cluster = [];
            dfs(node, cluster);
            clusters.push(cluster);
        }
    }
    return clusters;
}

// Helper: Topological sort for a cluster
function topologicalSort(cluster) {
    const sorted = [];
    const visited = new Set();
    const temp = new Set();

    const nodeMap = Object.fromEntries(cluster.map(n => [n.id, n]));

    function visit(node) {
        if (visited.has(node.id)) return;
        if (temp.has(node.id)) throw new Error('Cycle detected in node graph!');
        temp.add(node.id);
        for (const inputId of node.inputs || []) {
            if (nodeMap[inputId]) visit(nodeMap[inputId]);
        }
        temp.delete(node.id);
        visited.add(node.id);
        sorted.push(node);
    }

    for (const node of cluster) {
        if (!visited.has(node.id)) visit(node);
    }
    return sorted;
}

// Main: Run all clusters in depth order
async function runAllNodes() {
    const nodes = window.nodeData;
    const clusters = findClusters(nodes);

    // Map nodeId to cluster index and sort order for debugging
    const nodeDebugInfo = {};

    clusters.forEach((cluster, clusterIdx) => {
        const ordered = topologicalSort(cluster);
        ordered.forEach((node, sortIdx) => {
            nodeDebugInfo[node.id] = {
                cluster: clusterIdx,
                sortOrder: sortIdx
            };
        });
    });

    // Attach debug info to node DOM elements
    clusters.forEach((cluster, clusterIdx) => {
        const ordered = topologicalSort(cluster);
        ordered.forEach((node, sortIdx) => {
            const el = document.querySelector(`.card[data-id="${node.id}"]`);
            if (el) {
                el.setAttribute('data-cluster', clusterIdx);
                el.setAttribute('data-sort-order', sortIdx);
                // Optionally, show as a badge or tooltip
                el.title = `Cluster: ${clusterIdx}, Order: ${sortIdx}`;
            }
        });
    });

    // Run nodes in order
    // for (const cluster of clusters) {
    //     const ordered = topologicalSort(cluster);
    //     for (const node of ordered) {
    //         const runner = getRunnerForNode(node);
    //         await runner.run();
    //     }
    // }
}

// Export for use elsewhere
window.runAllNodes = runAllNodes;

async function runNodeCluster(nodeId){
    const nodes = window.nodeData;
    const clusters = findClusters(nodes);

    const clusterIdx = clusters.findIndex(cluster =>
        cluster.some(node => node.id === nodeId)
    );

    // Map nodeId to cluster index and sort order for debugging
    const nodeDebugInfo = {};

    clusters.forEach((cluster, clusterIdx) => {
        const ordered = topologicalSort(cluster);
        ordered.forEach((node, sortIdx) => {
            nodeDebugInfo[node.id] = {
                cluster: clusterIdx,
                sortOrder: sortIdx
            };
        });
    });

    // Attach debug info to node DOM elements
    clusters.forEach((cluster, clusterIdx) => {
        const ordered = topologicalSort(cluster);
        ordered.forEach((node, sortIdx) => {
            const el = document.querySelector(`.card[data-id="${node.id}"]`);
            if (el) {
                el.setAttribute('data-cluster', clusterIdx);
                el.setAttribute('data-sort-order', sortIdx);
                // Optionally, show as a badge or tooltip
                el.title = `Cluster: ${clusterIdx}, Order: ${sortIdx}`;
            }
        });
    });

    if (clusterIdx < 0 || clusterIdx >= clusters.length) {
        console.warn('Invalid cluster index:', clusterIdx);
        return;
    }
    const ordered = topologicalSort(clusters[clusterIdx]);
    for (const node of ordered) {
        const runner = getRunnerForNode(node);
        await runner.run();
    }
}

window.runNodeCluster = runNodeCluster;