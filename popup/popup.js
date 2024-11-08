let listenersInitialized = false;  // Flag to check if listeners are initialized

const summarizeButton = document.getElementById('summarizeButton');
const sendButton = document.getElementById('sendButton');
const analyzeButton = document.getElementById('analyzeButton');
const chatWindow = document.getElementById('chatWindow');
const outputElement = document.createElement('p');

// Listener for messages from sidebar
const onMessageListener = (request, sender, sendResponse) => {
  outputElement.className = 'bot-p';

  switch (request.action) {
    case "activateSummaryButton":
      summarizeButton.disabled = false;
      break;
    case "activateSendButton":
      sendButton.disabled = false;
      chatWindow.innerHTML = '';
      outputElement.textContent = "Chatbot: I'm ready for any questions.";

      // Append the new output element to the chat window
      chatWindow.appendChild(outputElement);
      break;
    case "setChatBotOutput":
      sendButton.disabled = false;
      outputElement.innerHTML = `Chatbot: ${request.output}`;

      // Append the new output element to the chat window
      chatWindow.appendChild(outputElement);

      // Scroll to the bottom of the chat window
      chatWindow.scrollTop = chatWindow.scrollHeight;
      break;
  }
};

// This function initializes the listeners if they haven't been initialized yet
function initializeListeners() {
  if (!listenersInitialized) {
    chrome.runtime.onMessage.addListener(onMessageListener);
    listenersInitialized = true;

    // Attach button listeners for summarize and send buttons
    summarizeButton.addEventListener('click', summarizeContent);
    sendButton.addEventListener('click', sendChatMessage);
  }
}

// This function removes the listeners when the popup is closed
function removeListeners() {
  if (listenersInitialized) {
    chrome.runtime.onMessage.removeListener(onMessageListener);
    summarizeButton.removeEventListener('click', summarizeContent);
    sendButton.removeEventListener('click', sendChatMessage);
    listenersInitialized = false;
  }
}

// Ensure listeners are cleaned up when the popup closes (or window is removed)
chrome.windows.onRemoved.addListener(removeListeners);

// Run when popup is opened
chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
  const tabId = tabs[0].id;

  // Inject script and CSS once when popup opens
  await chrome.scripting.executeScript({
    target: { tabId: tabId },
    files: ["./dist/content.bundle.js"]
  });

  await chrome.scripting.insertCSS({
    target: { tabId: tabId },
    files: ["./content/sidebar/sidebar.css"]
  });

  // Send the message to show sidebar after script injection
  chrome.tabs.sendMessage(tabId, { action: "showSidebar", tabId: tabId });

  // Send the message to check on statuses
  const status = await chrome.tabs.sendMessage(tabId, { action: "getStatuses", tabId: tabId });
  console.log(status);

  // If Initialization isn't running, run it
  if (status.initializationStatus === "no") {
    // Send the message to initialize model
    chrome.tabs.sendMessage(tabId, { action: "initializeModel", tabId: tabId });
  }

  // If model is ready, activate chatbot
  if (status.modelStatus === "yes") {
    sendButton.disabled = false;
    chatWindow.innerHTML = '';
    outputElement.textContent = "Chatbot: I'm ready for any questions.";

    // Append the new output element to the chat window
    chatWindow.appendChild(outputElement);
  }

  // If model is ready and there isn't a summarization or analysis in progress, activate summary and analysis buttons
  if (status.modelStatus === "yes" && status.summarizationStatus === "yes" && status.analysisStatus === "yes") {
    summarizeButton.disabled = false;
  }

  // Initialize listeners
  initializeListeners();
});

// Summarize button click handler
async function summarizeContent() {
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    const userInput = document.getElementById('userInput');

    // Update Summarize Button State
    summarizeButton.disabled = true;

    console.log("Sending summarize message...");
    chrome.tabs.sendMessage(tabs[0].id, { action: "summarizeContent", focusInput: userInput.value });
  });
}

// Send button click handler
async function sendChatMessage() {
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    const userInput = document.getElementById('chatInput');
    const chatWindow = document.getElementById('chatWindow');
    const input = userInput.value;
    userInput.value = '';

    // Update Send Button State
    sendButton.disabled = true;

    // Create a new paragraph element for the input
    const inputElement = document.createElement('p');
    inputElement.className = 'user-p';
    inputElement.textContent = `User: ${input}`;

    // Append the new output element to the chat window
    chatWindow.appendChild(inputElement);

    // Scroll to the bottom of the chat window
    chatWindow.scrollTop = chatWindow.scrollHeight;

    chrome.tabs.sendMessage(tabs[0].id, { action: "getChatBotOutput", chatInput: input });
  });
}
