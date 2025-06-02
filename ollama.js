// Select the button by its ID
const button = document.getElementById('send-test-request');

// Add a click event listener to the button
button.addEventListener('click', async () => {
    try {
        // Set up the base URL for the local Ollama API
        const url = 'http://localhost:11434/api/chat';

        // Define the payload (your input prompt)
        const payload = {
            model: 'mario', // Replace with the model name you're using
            messages: [{ role: 'user', content: 'What is Python?' }],
        };

        // Make a POST request with streaming enabled
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        // Check the response status
        if (response.ok) {
            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let done = false;

            console.log('Streaming response from Ollama:');
            while (!done) {
                const { value, done: readerDone } = await reader.read();
                done = readerDone;

                if (value) {
                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split('\n').filter(line => line.trim() !== '');

                    for (const line of lines) {
                        try {
                            const jsonData = JSON.parse(line);
                            if (jsonData.message && jsonData.message.content) {
                                console.log(jsonData.message.content);
                            }
                        } catch (error) {
                            console.error(`Failed to parse line: ${line}`);
                        }
                    }
                }
            }
        } else {
            console.error(`Error: ${response.status}`);
            const errorText = await response.text();
            console.error(errorText);
            alert('Failed to make request to Ollama.');
        }
    } catch (error) {
        console.error('Error making request to Ollama:', error);
        alert('Failed to make request to Ollama.');
    }
});