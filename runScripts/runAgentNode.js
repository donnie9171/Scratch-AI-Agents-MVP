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

    try {
      const url = "http://localhost:11434/api/chat";
      const payload = {
        model: "llama3.2",
        messages: [
            // { role: "system", content: prompt },
            { role: "user", content: question } // the entire questions has the system prompt in it too
        ],
      };

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
            this.setOutputValue(inference)  
      } else {
        console.error(`Error: ${response.status}`);
        const errorText = await response.text();
        console.error(errorText);
      }
    } catch (error) {
      console.error("Error making request to Ollama:", error);
    }
  }
}

window.RunAgentNode = RunAgentNode;
