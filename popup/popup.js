const summarizeButton = document.getElementById('summarizeButton');
const sendButton = document.getElementById('sendButton');
const analyzeButton = document.getElementById('analyzeButton');
const chatWindow = document.getElementById('chatWindow');
const outputElement = document.createElement('p');

// Listener for messages from sidebar
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  outputElement.className = 'bot-p';

  switch (request.action) {

    // Activates analysis button when summary generation is complete
    case "activateSummaryButton":
      summarizeButton.disabled = false;
      break;

    // Activates chat bot send button when model is ready
    case "activateSendButton":
      sendButton.disabled = false;
      chatWindow.innerHTML = '';
      outputElement.textContent = `Chatbot: I'm ready for any questions.`;

      // Append the new output element to the chat window
      chatWindow.appendChild(outputElement);
      break;

    // Adds output message to chat
    case "setChatBotOutput":
      sendButton.disabled = false;
      outputElement.textContent = `Chatbot: ${request.output}`;

      // Append the new output element to the chat window
      chatWindow.appendChild(outputElement);

      // Scroll to the bottom of the chat window
      chatWindow.scrollTop = chatWindow.scrollHeight;
      break;
  }
});

// Run when popup is opened
chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
  const tabId = tabs[0].id;

  // Inject script and CSS once when popup opens
  await chrome.scripting.executeScript({
    target: { tabId: tabId },
    files: ["./sidebar/content.js"]
  });

  await chrome.scripting.insertCSS({
    target: { tabId: tabId },
    files: ["./sidebar/sidebar.css"]
  });

  // Send the message to show sidebar after script injection
  chrome.tabs.sendMessage(tabId, { action: "showSidebar", tabId: tabId });

  // Send the message to check on statuses
  const status = await chrome.tabs.sendMessage(tabId, { action: "getStatuses", tabId: tabId });
  console.log(status);

  // If Initialization isn't running, run it
  if (status.initializationStatus === "yes") {

    // Send the message to initialize model
    chrome.tabs.sendMessage(tabId, { action: "initializeModel", tabId: tabId });
  }

  // If model is ready, activate chatbot
  if (status.modelStatus === "yes") {
    sendButton.disabled = false;
    chatWindow.innerHTML = '';
    outputElement.textContent = `Chatbot: I'm ready for any questions.`;

    // Append the new output element to the chat window
    chatWindow.appendChild(outputElement);
  }

  // If model is ready and there isn't a summarization or analysis in progress, activate summary and analysis buttons
  if (status.modelStatus === "yes" && status.summarizationStatus === "yes" && status.analysisStatus === "yes") {
    summarizeButton.disabled = false;
  }

});

// Summarize button is pressed
document.getElementById('summarizeButton').addEventListener('click', async () => {
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    const userInput = document.getElementById('userInput');

    // Update Summarize Button State
    summarizeButton.disabled = true;

    console.log("Sending summarize message...");
    chrome.tabs.sendMessage(tabs[0].id, { action: "summarizeContent", focusInput: userInput.value });
  });
});

// Send button for chat bot is pressed
document.getElementById('sendButton').addEventListener('click', async () => {
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    const userInput = document.getElementById('chatInput');
    const chatWindow = document.getElementById('chatWindow');
    const input = userInput.value;
    userInput.value = '';

    // Update Send Button State
    const sendButton = document.getElementById('sendButton');
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
});