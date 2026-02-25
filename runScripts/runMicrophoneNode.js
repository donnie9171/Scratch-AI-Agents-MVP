// Microphone node runner: handles speech recognition, triggers, and UI updates
class RunMicrophoneNode extends window.RunNode {
	constructor(node, context) {
		super(node, context);
		this.recognition = null;
		this.isListening = false;
		this.transcription = '';
	}

	// Called when an input triggers this node
	async run(triggeringInputNodeId) {
		console.log(`Running MicrophoneNode ${this.node.id} triggered by input node ${triggeringInputNodeId}`);
		// Get start/stop triggers as arrays of labels/IDs
		const startTriggers = (this.node.data?.startTriggers || '').split(',').map(s => s.trim()).filter(Boolean);
		const stopTriggers = (this.node.data?.stopTriggers || '').split(',').map(s => s.trim()).filter(Boolean);
		const language = this.node.data?.language || 'en-US';

		console.log('Start triggers:', startTriggers);
		console.log('Stop triggers:', stopTriggers);
		console.log('Current language:', language);
		console.log('Current isListening:', this.isListening);

		// Find label for triggering input node
		let triggeringLabel = '';
		if (triggeringInputNodeId) {
			const inputNode = window.nodeData.find(n => n.id === triggeringInputNodeId);
			triggeringLabel = inputNode?.data?.label || inputNode?.id || '';
			console.log('Triggering input node label:', triggeringLabel);
		} else {
			console.log('No triggeringInputNodeId provided');
		}

		// If already listening and stop trigger matches, stop recognition
		if (this.isListening && stopTriggers.includes(`{{`+triggeringLabel+`}}`)) {
			console.log('Stop trigger matched. Stopping recognition.');
			this.stopRecognition();
			// Wait for recognition to actually stop before resolving
			return new Promise(resolve => {
				const origOnEnd = this.recognition && this.recognition.onend;
				this.recognition.onend = (...args) => {
					if (origOnEnd) origOnEnd.apply(this.recognition, args);
					resolve();
				};
			});
		}

		// If not listening and start trigger matches, start recognition
		if (!this.isListening && startTriggers.includes(`{{`+triggeringLabel+`}}`)) {
			console.log('Start trigger matched. Starting recognition.');
			// Return a promise that resolves when recognition ends
			return new Promise(resolve => {
				this.startRecognition(language, resolve);
			});
		}

		console.log('No trigger matched. No action taken.');
		// Default: resolve immediately
		return;
	}

	startRecognition(language, onComplete) {
        console.log(`Starting speech recognition with language ${language}`);
		if (!('webkitSpeechRecognition' in window) && typeof window.SpeechRecognition === 'undefined') {
			this.updateStatus('error', 'Speech recognition not supported');
			return;
		}
		// Use webkitSpeechRecognition or standard
		const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
		this.recognition = new SpeechRecognition();
		this.recognition.lang = language;
		this.recognition.continuous = false;
		this.recognition.interimResults = true;
		this.transcription = '';
		this.isListening = true;
		// Set node state to running while transcription is ongoing
		window.runtimeState.setNodeState(this.node.id, { runStatus: "running" });
		this.updateStatus('listening');

		this.recognition.onresult = (event) => {
			let transcript = '';
			let finalTranscript = '';
			for (let i = 0; i < event.results.length; ++i) {
				const result = event.results[i];
				transcript += result[0].transcript;
				if (result.isFinal) {
					finalTranscript += result[0].transcript;
				}
			}
			// Show live transcript (interim or final)
			this.updateTranscription(transcript);
			// Store only the final transcript for output
			this.transcription = finalTranscript || transcript;
		};
		this.recognition.onerror = (event) => {
			this.updateStatus('error', event.error);
			this.isListening = false;
		};
		this.recognition.onend = () => {
			this.isListening = false;
			this.updateStatus('off');
			// Set node state to complete and output value
			window.runtimeState.setNodeState(this.node.id, { runStatus: "complete" });
			this.setOutputValue(this.transcription);
			// Trigger next node(s) only after transcription ends
			const outputs = this.getOutputs();
			if (outputs && outputs.length > 0) {
				outputs.forEach(node => {
					if (node && typeof node.runner?.run === 'function') {
						node.runner.run(this.node.id);
					}
				});
			}
			if (typeof onComplete === 'function') onComplete();
		};
		this.recognition.start();
	}

	stopRecognition() {
		if (this.recognition && this.isListening) {
			this.recognition.stop();
			this.isListening = false;
			this.updateStatus('off');
		}
	}

	updateStatus(status, errorMsg) {
		// Update node data and UI
		this.node.data.micStatus = status;
		if (status === 'error' && errorMsg) {
			this.node.data.micError = errorMsg;
		}
		// Update inspector panel if present
		const el = document.getElementById('mic-status-indicator');
		if (el) {
			let color = '#888', text = 'Unknown';
			if (status === 'listening') { color = '#ff0000'; text = 'Listening'; }
			else if (status === 'off') { color = '#aaa'; text = 'Off'; }
			else if (status === 'error') { color = '#e53935'; text = 'Error'; }
			el.style.background = color;
			el.textContent = text;
		}
	}

	updateTranscription(text) {
		// Store in runtime state for inspector panel
		window.runtimeState.setNodeState(this.node.id, { transcription: text });
		// Update inspector panel if present
		const el = document.getElementById('mic-live-transcription');
		if (el) el.textContent = text || '(empty)';
	}
}

window.RunMicrophoneNode = RunMicrophoneNode;
