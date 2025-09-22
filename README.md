## Now using webpack as of September 2025
at root,
```sh
npm run build
cd public
```
host on liveserver to port: 5501


## Getting Started

This project includes a static vanilla JS frontend (`index.html`) and an Azure Function backend for API proxying and token usage tracking (in the `azure` folder).

### Quick Start (Frontend Only)

1. **Clone the repository:**
   ```sh
   git clone https://github.com/donnie9171/Scratch-AI-Agents-MVP.git
   cd Scratch-AI-Agents-MVP
   ```

2. **Open `index.html` in your browser to use the frontend.**

   > **Note:** For best results and to avoid CORS errors, use an extension like [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) to host the frontend on port `5501`. This will match the expected origin for the live backend.

   The default configuration uses the live Azure backend—no local backend setup is required for basic testing.

---

### Run Azure Function Backend Locally

1. **Install dependencies:**
   ```sh
   cd azure
   npm install
   cp local.settings-example.json local.settings.json
   ```

2. **Update Key values**
   Update the following values in local.settings.json with valid keys:
    ``` 
    "OPENAI_API_KEY": "..."
    "TABLE_STORAGE_CONNECTION_STRING": "..."
    "AzureWebJobsStorage": "..."
    ```

3. **Start the Azure Function locally:**
   ```sh
   func start
   ```
   (Requires [Azure Functions Core Tools](https://docs.microsoft.com/azure/azure-functions/functions-run-local) and Node.js)

To use your local backend, update the frontend `config.js` to point to `http://localhost:7071`.
