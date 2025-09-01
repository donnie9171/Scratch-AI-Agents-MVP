const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: [
    './helper/setupReceiverNode.js',
    './nodeEditor/dragAndDrop.js',
    './nodeEditor/loadNodes.js',
    './components/saveModal.js',
    './nodeEditor/inspector/inspectorModal.js',
    './nodeEditor/nodeCreation.js',
    './nodeEditor/dragNodeConnections.js',
    './nodeEditor/cutNodeConnections.js',
    './nodeEditor/renderNodeConnections.js',
    './scratchIframe.js',
    './helper/azureConfig.js',
    './helper/userId.js',
    './components/tokenBucketBar.js',
    './runScripts/runNode.js',
    './runScripts/runVariableNode.js',
    './runScripts/runTextNode.js',
    './runScripts/runAgentNode.js',
    './runScripts/runReceiverNode.js',
    './runScripts/runBroadcasterNode.js',
    './runScripts/runCommentNode.js',
    './runScripts/runCostumeNode.js',
    './runScripts/runManager.js',
    './components/loadProjectModal.js',
    './components/DropdownMenu.js',
    './components/loadDropdown.js',
  ],
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'public'),
  },
  mode: 'production',
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: 'nodeEditor/inspector/', to: 'nodeEditor/inspector/' },
        { from: 'components/*.css', to: 'components/[name][ext]' }
      ]
    })
  ]
};