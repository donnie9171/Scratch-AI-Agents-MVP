# Creating New Nodes: Generalized Process

This document outlines the general process for adding a new node type to the Scratch-AI-Agents-MVP system. Follow these steps for any future node implementation.

---

## 1. **Define the Node Type**
- Choose a unique type identifier (e.g., `tool:audio-observer`).
- Add the new type to your node creation logic (e.g., in `nodeCreation.js`).
- Provide a way to create the node in the UI:
    - Add a button in index.html
    - Change the color for the button in styles.css (it uses the id to reference)

## 2. **Update Node Rendering in loadNodes.js**
- Update the `renderNodes` function in `loadNodes.js` to recognize and properly render your new node type.
- Assign an icon, color, and label for your node in the rendering logic.
- Ensure any special UI or connection points are handled for your node type.

## 3. **Implement the Inspector Panel**
- Create a new inspector panel function in `inspectorPanel...js` for your node type.
- Render the node’s configuration UI (fields, dropdowns, etc.).
- Ensure changes update `node.data` and are saved to localStorage.

## 4. **Add Node Runtime Logic**
- Create a `Run[NodeType]Node` class in `runScripts/`.
- Implement the `run()` method to perform the node’s main function.
- Set the node’s output value using `this.setOutputValue(...)`.
- Add the new function to the list at runManager.js
- Add the run script to the webpack.config.js 

## 5. **Integrate with Node Graph**
- Ensure the node can connect to other nodes as inputs/outputs as needed.
- Make sure its output can be used by downstream nodes.

## 6. **Save and Load Support**
- Ensure all configuration and state is stored in `node.data`.
- Test that saving and loading a project restores the node’s state and connections.

## 7. **Polish and Test**
- Add error handling and validation for user input.
- Provide visual feedback in the inspector if appropriate.
- Test the node’s behavior in various scenarios (creation, deletion, connection, project reload).

---

## **Summary Table**

| Step | Description                                      |
|------|--------------------------------------------------|
| 1    | Define node type and creation UI                 |
| 2    | Update node rendering in `loadNodes.js`          |
| 3    | Implement inspector panel for configuration      |
| 4    | Add runtime logic (`run()` method)               |
| 5    | Integrate with node graph (inputs/outputs)       |
| 6    | Ensure save/load support                         |
| 7    | Polish, error handling, and testing              |

---

**Tip:**  
Use existing node implementations as references for structure and best practices.