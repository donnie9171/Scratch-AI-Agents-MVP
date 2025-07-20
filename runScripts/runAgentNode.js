class RunAgentNode extends window.RunNode {
  async run() {
    const prompt = "Play rock, paper, scissors with me. Your options are rock, paper, and scissors only. Always respond with your choice in ONE WORD ONLY and in all lowercase (either rock, paper, or scissors)."; // example prompt
    let question = "You are player 1 and the opponent is player 2. The game history is attached after this. What's your next move? P1: rock, P2: paper, Winner: P2,P1: paper, P2: scissors, Winner: P2,P1: rock, P2: scissors, Winner: P1,P1: paper, P2: rock, Winner: P1,P1: scissors, P2: paper, Winner: P1"; // what we send to the model

    if(this.node.inputs && this.node.inputs.length > 0) {
        // If there are inputs, we can process them
        let tempQuestion = ""
        const inputNodes = this.getInputs();
        for (const inputNode of inputNodes) {
            tempQuestion += window.runtimeState.getNodeState(inputNode.id)?.outputValue || '';
        }
        question = tempQuestion;
    }

    const model = this.node.data?.model || 'gpt-3.5-turbo';

    try {
      let url, payload;
      if (model === 'llama-3.2') {
        url = "http://localhost:11434/api/chat";
        payload = {
          model: "llama3.2",
          messages: [
            { role: "user", content: question }
          ],
        };
        // Llama streaming response
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const reader = response.body.getReader();
          const decoder = new TextDecoder("utf-8");
          let done = false;
          let inference = "";

          while (!done) {
            const { value, done: readerDone } = await reader.read();
            done = readerDone;

            if (value) {
              const chunk = decoder.decode(value, { stream: true });
              const lines = chunk
                .split("\n")
                .filter((line) => line.trim() !== "");

              for (const line of lines) {
                try {
                  const jsonData = JSON.parse(line);
                  if (jsonData.message && jsonData.message.content) {
                    inference += jsonData.message.content;
                    window.runtimeState.setNodeState(this.node.id, {
                      prompt: question,
                      inference: inference,
                    });
                    window.updateAgentPanel();
                  }
                } catch (error) {
                  console.error(`Failed to parse line: ${line} with error ${error}`);
                }
              }
            }
          }
          this.setOutputValue(inference);
        } else {
          console.error(`Error: ${response.status}`);
          const errorText = await response.text();
          console.error(errorText);
        }
      } else if (model === 'gpt-3.5-turbo') {
        url = "https://multiagent-exploration-workbench-c8htdxerg6d9faa0.uksouth-01.azurewebsites.net/api/oai1";
        payload = {
          endpoint: "https://api.openai.com/v1/chat/completions",
          payload: {
            model: "gpt-3.5-turbo",
            messages: [
              { role: "user", content: question }
            ]
          }
        };
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const result = await response.json();
          let inference = "";
          console.log("OpenAI response:", JSON.stringify(result.body, null, 2));
          // The Azure Function returns { status, body } where body is the OpenAI response
          // Accept both Azure relay (result.body) and direct OpenAI response (result)
          let choices = null;
          if (result && result.body && result.body.choices) {
            choices = result.body.choices;
          } else if (result && result.choices) {
            choices = result.choices;
          }
          if (choices && choices.length > 0) {
            inference = choices[0].message?.content || "";
          } else if (result && result.body && result.body.error) {
            inference = `Error: ${result.body.error.message || JSON.stringify(result.body.error)}`;
          } else {
            inference = JSON.stringify(result, null, 2);
          }
          window.runtimeState.setNodeState(this.node.id, {
            prompt: question,
            inference: inference,
          });
          window.updateAgentPanel();
          this.setOutputValue(inference);
        } else {
          console.error(`Error: ${response.status}`);
          const errorText = await response.text();
          window.runtimeState.setNodeState(this.node.id, {
            prompt: question,
            inference: `API error: ${errorText}`,
          });
          window.updateAgentPanel();
          this.setOutputValue(`API error: ${errorText}`);
          console.error(errorText);
        }
      } else {
        console.error(`Unknown model: ${model}`);
      }
    } catch (error) {
      console.error("Error making request to agent API:", error);
      if (error && error.stack) {
        console.error("Stack trace:", error.stack);
      } else {
        console.error("Error object:", error);
      }
    }
  }
}

window.RunAgentNode = RunAgentNode;
