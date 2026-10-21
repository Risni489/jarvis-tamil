// JARVIS Tamil - Personal AI Assistant
const API_BASE = "https://jarvis-tamil.nasarmohamedrisni.workers.dev";

const chatBox = document.getElementById("chat");
const messageInput = document.getElementById("message");
const sendButton = document.getElementById("sendBtn");

let chatHistory = [];
let isSpeakingEnabled = true;

// Add message to chat
function addMessage(text, sender) {
  const message = document.createElement("div");
  message.className = "msg " + sender;

  if (sender === "bot") {
    const title = document.createElement("div");
    title.className = "who";
    title.textContent = "JARVIS";
    message.appendChild(title);
  }

  const content = document.createElement("div");
  content.textContent = text;
  message.appendChild(content);

  chatBox.appendChild(message);
  chatBox.scrollTop = chatBox.scrollHeight;

  return message;
}

// Speak AI response
function speakResponse(text) {
  if (!isSpeakingEnabled || !("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel();

  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = /[\u0B80-\u0BFF]/.test(text)
    ? "ta-IN"
    : "en-US";
  speech.rate = 1;

  const voices = window.speechSynthesis.getVoices();
  const tamilVoice = voices.find(voice =>
    voice.lang.toLowerCase().startsWith("ta")
  );

  if (tamilVoice) speech.voice = tamilVoice;

  window.speechSynthesis.speak(speech);
}

// Send message to real AI backend
async function sendMessage() {
  const message = messageInput.value.trim();

  if (!message || sendButton.disabled) return;

  addMessage(message, "user");
  messageInput.value = "";
  sendButton.disabled = true;

  const waitingMessage = addMessage(
    "பதில் தயாராகிறது... கொஞ்சம் காத்திரு.",
    "bot"
  );

  try {
    const response = await fetch(API_BASE + "/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: message,
        history: chatHistory.slice(-10)
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "API connection failed");
    }

    if (!data.reply) {
      throw new Error("AI பதில் கிடைக்கவில்லை.");
    }

    waitingMessage.lastChild.textContent = data.reply;

    chatHistory.push(
      { role: "user", content: message },
      { role: "assistant", content: data.reply }
    );

    speakResponse(data.reply);

  } catch (error) {
    waitingMessage.lastChild.textContent =
      "மன்னிக்கவும்! AI இணைப்பில் பிரச்சினை.\n" +
      error.message +
      "\nCloudflare Worker மற்றும் GROQ_API_KEY-ஐ சரிபார்.";
  } finally {
    sendButton.disabled = false;
    messageInput.focus();
    chatBox.scrollTop = chatBox.scrollHeight;
  }
}

// Send button
sendButton.addEventListener("click", sendMessage);

// Enter key to send; Shift + Enter for new line
messageInput.addEventListener("keydown", event => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
});

// Voice on/off button
const voiceButton = document.getElementById("voiceBtn");

if (voiceButton) {
  voiceButton.addEventListener("click", () => {
    isSpeakingEnabled = !isSpeakingEnabled;

    voiceButton.textContent = isSpeakingEnabled
      ? "🔊 Voice: ON"
      : "🔇 Voice: OFF";

    if (!isSpeakingEnabled && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  });
}

// Clear chat button
const clearButton = document.getElementById("clearBtn");

if (clearButton) {
  clearButton.addEventListener("click", () => {
    chatBox.replaceChildren();
    chatHistory = [];

    addMessage(
      "வணக்கம்! மீண்டும் பேசலாம். என்ன உதவி வேண்டும்?",
      "bot"
    );
  });
}

// Microphone voice input
const microphoneButton = document.getElementById("micBtn");
const SpeechRecognition =
  window.SpeechRecognition ||
  window.webkitSpeechRecognition;

if (microphoneButton && SpeechRecognition) {
  const recognition = new SpeechRecognition();

  recognition.lang = "ta-LK";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  microphoneButton.addEventListener("click", () => {
    try {
      recognition.start();
    } catch (error) {
      console.log("Microphone is already active.");
    }
  });

  recognition.onresult = event => {
    messageInput.value =
      event.results[0][0].transcript;
    messageInput.focus();
  };

  recognition.onerror = event => {
    console.log("Microphone error:", event.error);
  };
} else if (microphoneButton) {
  microphoneButton.addEventListener("click", () => {
    alert(
      "Voice input இந்த browser-ல் ஆதரிக்கப்படவில்லை. Android Chrome-ல் முயற்சி செய்."
    );
  });
}
